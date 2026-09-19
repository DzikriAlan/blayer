import {
  Prisma,
  AgentEnvironment,
  AgentMessageRole,
  AgentRunStatus,
  ToolCallStatus,
  ToolPermission,
  type Integration,
  type ToolDefinition,
} from '@prisma/client'

import { prisma } from './prisma'
import { getEffortLevel, getRunCostUsd } from './agentCatalog'
import { ENCRYPTION_KEY_ENV, decryptSecret } from './agentCrypto'
import { executeTool } from './toolExecutor'
import { getProviderAdapter } from './providers'
import {
  ProviderError,
  type ProviderMessage,
  type ProviderTool,
  type ProviderToolCall,
} from './providers/providerTypes'
import { getErrorFields, logger } from './logger'

// Batas putaran tool dalam satu eksekusi. Tanpa ini, model yang salah paham bisa
// memanggil tool berulang kali sampai token dan biaya habis.
export const MAX_TOOL_STEPS = 6
const MAX_KNOWLEDGE_CHARS = 24_000
const MAX_MEMORY_MESSAGES = 20

export class RuntimeError extends Error {
  readonly code: string
  readonly status: number
  readonly field: string

  constructor(code: string, message: string, status: number, field = '') {
    super(message)
    this.name = 'RuntimeError'
    this.code = code
    this.status = status
    this.field = field
  }
}

export interface RunAgentInput {
  agentId: string
  environment: AgentEnvironment
  input: string
  versionId?: string | null
  sessionId?: string | null
  // Diisi saat pemanggilnya memakai API key project; eksekusi lintas project
  // lalu ditolak seolah agentnya tidak ada.
  scopedProjectId?: string | null
}

export interface RunToolCallResult {
  id: string
  name: string
  permission: ToolPermission
  status: ToolCallStatus
  input: Record<string, unknown>
  output: string
}

export interface RunAgentResult {
  runId: string
  agentId: string
  version: number
  versionId: string
  environment: AgentEnvironment
  provider: string
  model: string
  status: AgentRunStatus
  output: string
  stopReason: string
  latencyMs: number
  inputTokens: number
  outputTokens: number
  costUsd: number | null
  sessionId: string | null
  toolCalls: RunToolCallResult[]
  // Terisi saat eksekusi berhenti menunggu konfirmasi tool yang mengubah data.
  pendingToolCall: {
    id: string
    name: string
    input: Record<string, unknown>
  } | null
}

type ToolContext = ToolDefinition & { integration: Integration }

const GUARDRAILS = [
  'Aturan yang tidak boleh dilanggar:',
  '- Jangan mengarang angka, tanggal, nama, atau status. Kalau datanya tidak ada di percakapan, hasil tool, atau pengetahuan yang diberikan, katakan tidak tahu.',
  '- Panggil tool yang tersedia untuk mengambil data; jangan menebak isinya.',
  '- Tool yang mengubah data hanya dijalankan setelah dikonfirmasi manusia. Jelaskan apa yang akan diubah sebelum memanggilnya.',
  '- Jawab dalam bahasa yang dipakai penanya.',
].join('\n')

const getSystemPrompt = (instructions: string, documents: { title: string; content: string }[]) => {
  const parts = [instructions.trim(), GUARDRAILS]

  if (documents.length) {
    let budget = MAX_KNOWLEDGE_CHARS

    const knowledge = documents
      .map((document) => {
        if (budget <= 0) return ''

        const body = document.content.slice(0, budget)
        budget -= body.length

        return `## ${document.title}\n${body}`
      })
      .filter(Boolean)
      .join('\n\n')

    if (knowledge) {
      parts.push(
        `Pengetahuan yang boleh dipakai sebagai rujukan (jangan mengarang di luar ini):\n\n${knowledge}`
      )
    }
  }

  return parts.join('\n\n')
}

const getProviderTools = (tools: ToolContext[]): ProviderTool[] =>
  tools.map((tool) => ({
    name: tool.name,
    description:
      tool.permission === ToolPermission.WRITE
        ? `${tool.description} (mengubah data; butuh konfirmasi manusia)`
        : tool.description,
    inputSchema: (tool.inputSchema ?? {
      type: 'object',
      properties: {},
    }) as Record<string, unknown>,
  }))

const getVersion = async (
  agentId: string,
  versionId: string | null | undefined,
  productionVersionId: string | null
) => {
  const id = versionId ?? productionVersionId
  if (!id) return null

  return prisma.agentVersion.findFirst({
    where: { id, agentId },
    include: {
      tools: { include: { toolDefinition: { include: { integration: true } } } },
      documents: { include: { document: true } },
    },
  })
}

const getMemory = async (sessionId: string): Promise<ProviderMessage[]> => {
  const messages = await prisma.agentMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    take: MAX_MEMORY_MESSAGES,
  })

  return messages.map((message) => ({
    role: message.role === AgentMessageRole.USER ? 'user' : 'assistant',
    content: message.content,
  }))
}

interface LoopContext {
  runId: string
  apiKey: string
  model: string
  provider: 'ANTHROPIC' | 'OPENAI'
  instructions: string
  tools: ToolContext[]
  maxTokens: number
  effort: ReturnType<typeof getEffortLevel>
  temperature: number | null
}

interface LoopResult {
  status: AgentRunStatus
  text: string
  stopReason: string
  inputTokens: number
  outputTokens: number
  messages: ProviderMessage[]
  toolCalls: RunToolCallResult[]
  pending: { id: string; name: string; input: Record<string, unknown> } | null
}

// Satu putaran percakapan: model menjawab, atau meminta tool. Tool baca
// dijalankan langsung; tool tulis berhenti di sini dan menunggu konfirmasi.
const runLoop = async (
  context: LoopContext,
  messages: ProviderMessage[]
): Promise<LoopResult> => {
  const adapter = getProviderAdapter(context.provider)
  const toolCalls: RunToolCallResult[] = []
  const conversation = [...messages]

  let inputTokens = 0
  let outputTokens = 0

  for (let step = 0; step < MAX_TOOL_STEPS; step += 1) {
    const result = await adapter({
      apiKey: context.apiKey,
      model: context.model,
      instructions: context.instructions,
      messages: conversation,
      tools: getProviderTools(context.tools),
      maxTokens: context.maxTokens,
      effort: context.effort,
      temperature: context.temperature,
    })

    inputTokens += result.inputTokens
    outputTokens += result.outputTokens

    if (!result.toolCalls.length) {
      return {
        status: AgentRunStatus.SUCCEEDED,
        text: result.text,
        stopReason: result.stopReason,
        inputTokens,
        outputTokens,
        messages: conversation,
        toolCalls,
        pending: null,
      }
    }

    conversation.push({
      role: 'assistant',
      content: result.text,
      toolCalls: result.toolCalls,
    })

    const writeCall = result.toolCalls.find((call) => {
      const definition = context.tools.find((tool) => tool.name === call.name)

      return definition?.permission === ToolPermission.WRITE
    })

    if (writeCall) {
      const definition = context.tools.find((tool) => tool.name === writeCall.name)

      const pending = await prisma.agentToolCall.create({
        data: {
          runId: context.runId,
          toolDefinitionId: definition?.id ?? '',
          name: writeCall.name,
          permission: ToolPermission.WRITE,
          status: ToolCallStatus.PENDING_CONFIRMATION,
          input: writeCall.input as Prisma.InputJsonValue,
          providerCallId: writeCall.id,
          state: {
            messages: conversation,
            toolCall: writeCall,
          } as unknown as Prisma.InputJsonValue,
        },
        select: { id: true },
      })

      return {
        status: AgentRunStatus.PENDING_CONFIRMATION,
        text: result.text,
        stopReason: 'pending_confirmation',
        inputTokens,
        outputTokens,
        messages: conversation,
        toolCalls: [
          ...toolCalls,
          {
            id: pending.id,
            name: writeCall.name,
            permission: ToolPermission.WRITE,
            status: ToolCallStatus.PENDING_CONFIRMATION,
            input: writeCall.input,
            output: '',
          },
        ],
        pending: { id: pending.id, name: writeCall.name, input: writeCall.input },
      }
    }

    for (const call of result.toolCalls) {
      const executed = await runToolCall(context, call)

      toolCalls.push(executed.record)
      conversation.push(executed.message)
    }
  }

  return {
    status: AgentRunStatus.SUCCEEDED,
    text: '',
    stopReason: 'max_tool_steps',
    inputTokens,
    outputTokens,
    messages: conversation,
    toolCalls,
    pending: null,
  }
}

const runToolCall = async (context: LoopContext, call: ProviderToolCall) => {
  const definition = context.tools.find((tool) => tool.name === call.name)

  if (!definition) {
    return {
      record: {
        id: '',
        name: call.name,
        permission: ToolPermission.READ,
        status: ToolCallStatus.FAILED,
        input: call.input,
        output: 'Tool tidak terpasang pada versi agent ini.',
      } satisfies RunToolCallResult,
      message: {
        role: 'tool' as const,
        toolCallId: call.id,
        content: 'Tool tidak terpasang pada versi agent ini.',
        isError: true,
      },
    }
  }

  const executed = await executeTool({
    integration: definition.integration,
    definition,
    input: call.input,
  })

  const record = await prisma.agentToolCall.create({
    data: {
      runId: context.runId,
      toolDefinitionId: definition.id,
      name: definition.name,
      permission: definition.permission,
      status: executed.isOk ? ToolCallStatus.SUCCEEDED : ToolCallStatus.FAILED,
      input: call.input as Prisma.InputJsonValue,
      output: executed.isOk ? executed.output : null,
      errorMessage: executed.isOk ? null : executed.output,
      latencyMs: executed.latencyMs,
      providerCallId: call.id,
      resolvedAt: new Date(),
    },
    select: { id: true },
  })

  return {
    record: {
      id: record.id,
      name: definition.name,
      permission: definition.permission,
      status: executed.isOk ? ToolCallStatus.SUCCEEDED : ToolCallStatus.FAILED,
      input: call.input,
      output: executed.output,
    } satisfies RunToolCallResult,
    message: {
      role: 'tool' as const,
      toolCallId: call.id,
      content: executed.output,
      isError: !executed.isOk,
    },
  }
}

export const runAgent = async ({
  agentId,
  environment,
  input,
  versionId,
  sessionId,
  scopedProjectId,
}: RunAgentInput): Promise<RunAgentResult> => {
  const agent = await prisma.agent.findUnique({ where: { id: agentId } })

  if (!agent || (scopedProjectId && agent.projectId !== scopedProjectId)) {
    throw new RuntimeError('AGENT_NOT_FOUND', 'Agent tidak ditemukan.', 404)
  }

  const version = await getVersion(agent.id, versionId, agent.productionVersionId)

  if (!version) {
    throw new RuntimeError(
      'AGENT_NOT_PUBLISHED',
      'Agent ini belum punya versi yang dipublikasikan.',
      409
    )
  }

  const credential = await prisma.providerCredential.findUnique({
    where: {
      projectId_provider_environment: {
        projectId: agent.projectId,
        provider: version.provider,
        environment,
      },
    },
  })

  if (!credential) {
    throw new RuntimeError(
      'PROVIDER_KEY_MISSING',
      `Project ini belum punya kunci ${version.provider} untuk environment ${environment}.`,
      409,
      'provider'
    )
  }

  const secret = decryptSecret(credential.secret)

  if (!secret) {
    throw new RuntimeError(
      'CONFIG_MISSING',
      `Kunci provider tidak bisa dibuka. Pastikan ${ENCRYPTION_KEY_ENV} masih kunci yang sama dengan saat kredensialnya disimpan.`,
      503,
      ENCRYPTION_KEY_ENV
    )
  }

  const session = sessionId
    ? await prisma.agentSession.findFirst({
        where: { id: sessionId, agentId: agent.id },
        select: { id: true },
      })
    : null

  if (sessionId && !session) {
    throw new RuntimeError(
      'SESSION_NOT_FOUND',
      'Sesi percakapan tidak ditemukan untuk agent ini.',
      404,
      'sessionId'
    )
  }

  const tools = version.tools.map((item) => item.toolDefinition)
  const documents = version.documents.map((item) => item.document)

  const run = await prisma.agentRun.create({
    data: {
      projectId: agent.projectId,
      agentId: agent.id,
      agentVersionId: version.id,
      sessionId: session?.id ?? null,
      environment,
      provider: version.provider,
      model: version.model,
      status: AgentRunStatus.FAILED,
      input,
      latencyMs: 0,
    },
    select: { id: true },
  })

  const startedAt = Date.now()

  const context: LoopContext = {
    runId: run.id,
    apiKey: secret,
    model: version.model,
    provider: version.provider,
    instructions: getSystemPrompt(version.instructions, documents),
    tools,
    maxTokens: version.maxTokens,
    effort: getEffortLevel(version.effort),
    temperature: version.temperature,
  }

  const history = session ? await getMemory(session.id) : []

  try {
    const result = await runLoop(context, [
      ...history,
      { role: 'user', content: input },
    ])

    const latencyMs = Date.now() - startedAt
    const costUsd = getRunCostUsd(
      version.model,
      result.inputTokens,
      result.outputTokens
    )

    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: result.status,
        output: result.text,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        costUsd,
        latencyMs,
      },
    })

    if (session && result.status === AgentRunStatus.SUCCEEDED) {
      await saveMemory(session.id, input, result.text)
    }

    return {
      runId: run.id,
      agentId: agent.id,
      version: version.version,
      versionId: version.id,
      environment,
      provider: version.provider,
      model: version.model,
      status: result.status,
      output: result.text,
      stopReason: result.stopReason,
      latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd,
      sessionId: session?.id ?? null,
      toolCalls: result.toolCalls,
      pendingToolCall: result.pending,
    }
  } catch (error) {
    const failure =
      error instanceof ProviderError
        ? error
        : new ProviderError('PROVIDER_FAILED', 'Eksekusi agent gagal.', 502)

    // Eksekusi yang gagal tetap tercatat. Tanpa itu, angka success rate di PRD
    // hanya menghitung yang berhasil dan selalu terlihat sempurna.
    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: AgentRunStatus.FAILED,
        errorCode: failure.code,
        errorMessage: failure.message,
        latencyMs: Date.now() - startedAt,
      },
    })

    logger.error('eksekusi agent gagal', {
      agentId: agent.id,
      versionId: version.id,
      provider: version.provider,
      model: version.model,
      ...getErrorFields(error),
    })

    throw new RuntimeError(failure.code, failure.message, failure.status)
  }
}

const saveMemory = async (sessionId: string, input: string, output: string) => {
  await prisma.agentMessage.createMany({
    data: [
      { sessionId, role: AgentMessageRole.USER, content: input },
      { sessionId, role: AgentMessageRole.ASSISTANT, content: output },
    ],
  })

  await prisma.agentSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  })
}

export interface ResumeRunInput {
  runId: string
  toolCallId: string
  isConfirmed: boolean
  scopedProjectId?: string | null
}

// Tool yang mengubah data berhenti di runtime dan baru dijalankan setelah ada
// konfirmasi eksplisit (PRD §5). Penolakan pun dikembalikan ke model supaya ia
// bisa menjawab pengguna dengan layak, bukan menggantung.
export const resumeRun = async ({
  runId,
  toolCallId,
  isConfirmed,
  scopedProjectId,
}: ResumeRunInput): Promise<RunAgentResult> => {
  const toolCall = await prisma.agentToolCall.findFirst({
    where: { id: toolCallId, runId },
    include: {
      toolDefinition: { include: { integration: true } },
      run: { include: { agent: true } },
    },
  })

  if (
    !toolCall ||
    (scopedProjectId && toolCall.run.projectId !== scopedProjectId)
  ) {
    throw new RuntimeError(
      'TOOL_CALL_NOT_FOUND',
      'Permintaan konfirmasi tidak ditemukan.',
      404
    )
  }

  if (toolCall.status !== ToolCallStatus.PENDING_CONFIRMATION) {
    throw new RuntimeError(
      'TOOL_CALL_RESOLVED',
      'Permintaan konfirmasi ini sudah diputuskan sebelumnya.',
      409
    )
  }

  const version = await prisma.agentVersion.findUnique({
    where: { id: toolCall.run.agentVersionId },
    include: {
      tools: { include: { toolDefinition: { include: { integration: true } } } },
      documents: { include: { document: true } },
    },
  })

  if (!version) {
    throw new RuntimeError('AGENT_NOT_PUBLISHED', 'Versi agent tidak ada.', 409)
  }

  const credential = await prisma.providerCredential.findUnique({
    where: {
      projectId_provider_environment: {
        projectId: toolCall.run.projectId,
        provider: version.provider,
        environment: toolCall.run.environment,
      },
    },
  })

  const secret = credential ? decryptSecret(credential.secret) : null

  if (!secret) {
    throw new RuntimeError(
      'PROVIDER_KEY_MISSING',
      'Kunci provider untuk environment ini tidak tersedia lagi.',
      409,
      'provider'
    )
  }

  const state = (toolCall.state ?? {}) as {
    messages?: ProviderMessage[]
    toolCall?: ProviderToolCall
  }

  const conversation = state.messages ?? []
  const providerCall = state.toolCall ?? {
    id: toolCall.providerCallId ?? '',
    name: toolCall.name,
    input: (toolCall.input ?? {}) as Record<string, unknown>,
  }

  const context: LoopContext = {
    runId: toolCall.runId,
    apiKey: secret,
    model: version.model,
    provider: version.provider,
    instructions: getSystemPrompt(
      version.instructions,
      version.documents.map((item) => item.document)
    ),
    tools: version.tools.map((item) => item.toolDefinition),
    maxTokens: version.maxTokens,
    effort: getEffortLevel(version.effort),
    temperature: version.temperature,
  }

  const startedAt = Date.now()
  const executed = isConfirmed
    ? await executeTool({
        integration: toolCall.toolDefinition.integration,
        definition: toolCall.toolDefinition,
        input: providerCall.input,
      })
    : {
        isOk: false,
        output:
          'Operator menolak menjalankan tool ini. Jangan mencoba lagi; jelaskan penolakannya kepada pengguna.',
        latencyMs: 0,
      }

  await prisma.agentToolCall.update({
    where: { id: toolCall.id },
    data: {
      status: !isConfirmed
        ? ToolCallStatus.REJECTED
        : executed.isOk
          ? ToolCallStatus.SUCCEEDED
          : ToolCallStatus.FAILED,
      output: executed.isOk ? executed.output : null,
      errorMessage: executed.isOk ? null : executed.output,
      latencyMs: executed.latencyMs,
      resolvedAt: new Date(),
    },
  })

  const resumed: ProviderMessage[] = [
    ...conversation,
    {
      role: 'tool',
      toolCallId: providerCall.id,
      content: executed.output,
      isError: !executed.isOk,
    },
  ]

  try {
    const result = await runLoop(context, resumed)
    const latencyMs = toolCall.run.latencyMs + (Date.now() - startedAt)

    const inputTokens = toolCall.run.inputTokens + result.inputTokens
    const outputTokens = toolCall.run.outputTokens + result.outputTokens
    const costUsd = getRunCostUsd(version.model, inputTokens, outputTokens)

    await prisma.agentRun.update({
      where: { id: toolCall.runId },
      data: {
        status: result.status,
        output: result.text,
        inputTokens,
        outputTokens,
        costUsd,
        latencyMs,
      },
    })

    if (toolCall.run.sessionId && result.status === AgentRunStatus.SUCCEEDED) {
      await saveMemory(toolCall.run.sessionId, toolCall.run.input, result.text)
    }

    return {
      runId: toolCall.runId,
      agentId: toolCall.run.agentId,
      version: version.version,
      versionId: version.id,
      environment: toolCall.run.environment,
      provider: version.provider,
      model: version.model,
      status: result.status,
      output: result.text,
      stopReason: result.stopReason,
      latencyMs,
      inputTokens,
      outputTokens,
      costUsd,
      sessionId: toolCall.run.sessionId,
      toolCalls: [
        {
          id: toolCall.id,
          name: toolCall.name,
          permission: toolCall.permission,
          status: !isConfirmed
            ? ToolCallStatus.REJECTED
            : executed.isOk
              ? ToolCallStatus.SUCCEEDED
              : ToolCallStatus.FAILED,
          input: providerCall.input,
          output: executed.output,
        },
        ...result.toolCalls,
      ],
      pendingToolCall: result.pending,
    }
  } catch (error) {
    const failure =
      error instanceof ProviderError
        ? error
        : new ProviderError('PROVIDER_FAILED', 'Eksekusi agent gagal.', 502)

    await prisma.agentRun.update({
      where: { id: toolCall.runId },
      data: {
        status: AgentRunStatus.FAILED,
        errorCode: failure.code,
        errorMessage: failure.message,
      },
    })

    throw new RuntimeError(failure.code, failure.message, failure.status)
  }
}
