import {
  AgentEffort,
  AgentEnvironment,
  AgentRunStatus,
  ToolCallStatus,
  ToolPermission,
  type Integration,
  type Prisma,
  type ToolDefinition,
} from '@prisma/client'

import { getErrorFields, logger } from '@server/shared/utils/logger.util'
import {
  conflictError,
  notFoundError,
  serviceUnavailableError,
  HttpError,
} from '../http-error'
import { getEffortLevel, getRunCostUsd } from '../utils/catalog.util'
import { ENCRYPTION_KEY_ENV, decryptSecret } from '../utils/crypto.util'
import {
  agentRuntimeRepository,
  type AgentRuntimeRepository,
} from '../repositories/agentRuntime.repository'
import { fetchToolCall } from './toolExecutor.service'
import { getProviderAdapter } from './providers'
import {
  ProviderError,
  type ProviderMessage,
  type ProviderTool,
  type ProviderToolCall,
} from './providers/provider.types'

// Batas putaran tool dalam satu eksekusi. Tanpa ini, model yang salah paham bisa
// memanggil tool berulang kali sampai token dan biaya habis.
export const MAX_TOOL_STEPS = 6
const MAX_KNOWLEDGE_CHARS = 24_000
const MAX_MEMORY_MESSAGES = 20

const GUARDRAILS = [
  'Aturan yang tidak boleh dilanggar:',
  '- Jangan mengarang angka, tanggal, nama, atau status. Kalau datanya tidak ada di percakapan, hasil tool, atau pengetahuan yang diberikan, katakan tidak tahu.',
  '- Panggil tool yang tersedia untuk mengambil data; jangan menebak isinya.',
  '- Tool yang mengubah data hanya dijalankan setelah dikonfirmasi manusia. Jelaskan apa yang akan diubah sebelum memanggilnya.',
  '- Jawab dalam bahasa yang dipakai penanya.',
].join('\n')

type ToolContext = ToolDefinition & { integration: Integration }

export interface StoreAgentsRunDto {
  agentId: string
  environment: AgentEnvironment
  input: string
  versionId?: string | null
  sessionId?: string | null
  // Diisi saat pemanggilnya memakai API key project; eksekusi lintas project
  // lalu ditolak seolah agentnya tidak ada.
  scopedProjectId?: string | null
}

export interface StoreAgentsPreviewDto {
  projectId: string
  environment: AgentEnvironment
  provider: 'ANTHROPIC' | 'OPENAI'
  model: string
  effort: AgentEffort
  maxTokens: number
  temperature: number | null
  instructions: string
  toolIds: string[]
  documentIds: string[]
  messages: { role: 'user' | 'assistant'; content: string }[]
}

export interface AgentPreviewResponseDto {
  status: AgentRunStatus
  output: string
  stopReason: string
  latencyMs: number
  inputTokens: number
  outputTokens: number
  costUsd: number | null
  toolCalls: AgentRunToolCallDto[]
}

export interface StoreRunsConfirmDto {
  runId: string
  toolCallId: string
  isConfirmed: boolean
  scopedProjectId?: string | null
}

export interface AgentRunToolCallDto {
  id: string
  name: string
  permission: ToolPermission
  status: ToolCallStatus
  input: Record<string, unknown>
  output: string
}

export interface AgentRunResponseDto {
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
  toolCalls: AgentRunToolCallDto[]
  // Terisi saat eksekusi berhenti menunggu konfirmasi tool yang mengubah data.
  pendingToolCall: {
    id: string
    name: string
    input: Record<string, unknown>
  } | null
}

interface LoopContext {
  // Kosong saat pratinjau: tidak ada baris run yang bisa dirujuk, jadi tidak ada
  // yang disimpan.
  runId: string | null
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
  toolCalls: AgentRunToolCallDto[]
  pending: { id: string; name: string; input: Record<string, unknown> } | null
}

// Runtime dipakai dua feature (agents dan runs), jadi tempatnya di shared
// service sesuai aturan cross-feature.
export class AgentRuntimeService {
  constructor(private readonly agentRuntimeRepository: AgentRuntimeRepository) {}

  async storeAgentsRun({
    agentId,
    environment,
    input,
    versionId,
    sessionId,
    scopedProjectId,
  }: StoreAgentsRunDto): Promise<AgentRunResponseDto> {
    const agent = await this.agentRuntimeRepository.getAgentRuntimeAgent(agentId)

    if (!agent || (scopedProjectId && agent.projectId !== scopedProjectId)) {
      throw notFoundError('AGENT_NOT_FOUND', 'Agent tidak ditemukan.')
    }

    const targetVersionId = versionId ?? agent.productionVersionId

    const version = targetVersionId
      ? await this.agentRuntimeRepository.getAgentRuntimeVersion(
          agent.id,
          targetVersionId
        )
      : null

    if (!version) {
      throw conflictError(
        'AGENT_NOT_PUBLISHED',
        'Agent ini belum punya versi yang dipublikasikan.'
      )
    }

    const apiKey = await this.getProviderKey(
      agent.projectId,
      version.provider,
      environment
    )

    const session = sessionId
      ? await this.agentRuntimeRepository.getAgentRuntimeSession(
          sessionId,
          agent.id
        )
      : null

    if (sessionId && !session) {
      throw notFoundError(
        'SESSION_NOT_FOUND',
        'Sesi percakapan tidak ditemukan untuk agent ini.'
      )
    }

    const run = await this.agentRuntimeRepository.postAgentRuntimeRun({
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
    })

    const context: LoopContext = {
      runId: run.id,
      apiKey,
      model: version.model,
      provider: version.provider,
      instructions: this.getSystemPrompt(
        version.instructions,
        version.documents.map((item) => item.document)
      ),
      tools: version.tools.map((item) => item.toolDefinition),
      maxTokens: version.maxTokens,
      effort: getEffortLevel(version.effort),
      temperature: version.temperature,
    }

    const history = session ? await this.getMemory(session.id) : []
    const startedAt = Date.now()

    try {
      const result = await this.runLoop(context, [
        ...history,
        { role: 'user', content: input },
      ])

      const latencyMs = Date.now() - startedAt
      const costUsd = getRunCostUsd(
        version.model,
        result.inputTokens,
        result.outputTokens
      )

      await this.agentRuntimeRepository.updateAgentRuntimeRun(run.id, {
        status: result.status,
        output: result.text,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        costUsd,
        latencyMs,
      })

      if (session && result.status === AgentRunStatus.SUCCEEDED) {
        await this.agentRuntimeRepository.postAgentRuntimeMessageMany(
          session.id,
          input,
          result.text
        )
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
      // Eksekusi yang gagal tetap tercatat. Tanpa itu, angka success rate hanya
      // menghitung yang berhasil dan selalu terlihat sempurna.
      const failure = this.getProviderFailure(error)

      await this.agentRuntimeRepository.updateAgentRuntimeRun(run.id, {
        status: AgentRunStatus.FAILED,
        errorCode: failure.code,
        errorMessage: failure.message,
        latencyMs: Date.now() - startedAt,
      })

      logger.error('eksekusi agent gagal', {
        agentId: agent.id,
        versionId: version.id,
        provider: version.provider,
        model: version.model,
        ...getErrorFields(error),
      })

      throw new HttpError(failure.status, failure.code, failure.message)
    }
  }

  // Tool yang mengubah data berhenti di runtime dan baru dijalankan setelah ada
  // konfirmasi eksplisit. Penolakan pun dikembalikan ke model supaya ia bisa
  // menjawab pengguna dengan layak, bukan menggantung.
  async storeRunsConfirm({
    runId,
    toolCallId,
    isConfirmed,
    scopedProjectId,
  }: StoreRunsConfirmDto): Promise<AgentRunResponseDto> {
    const toolCall = await this.agentRuntimeRepository.getAgentRuntimeToolCall(
      toolCallId,
      runId
    )

    if (
      !toolCall ||
      (scopedProjectId && toolCall.run.projectId !== scopedProjectId)
    ) {
      throw notFoundError(
        'TOOL_CALL_NOT_FOUND',
        'Permintaan konfirmasi tidak ditemukan.'
      )
    }

    if (toolCall.status !== ToolCallStatus.PENDING_CONFIRMATION) {
      throw conflictError(
        'TOOL_CALL_RESOLVED',
        'Permintaan konfirmasi ini sudah diputuskan sebelumnya.'
      )
    }

    const version = await this.agentRuntimeRepository.getAgentRuntimeVersionById(
      toolCall.run.agentVersionId
    )

    if (!version) {
      throw conflictError('AGENT_NOT_PUBLISHED', 'Versi agent tidak ada.')
    }

    const apiKey = await this.getProviderKey(
      toolCall.run.projectId,
      version.provider,
      toolCall.run.environment
    )

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
      apiKey,
      model: version.model,
      provider: version.provider,
      instructions: this.getSystemPrompt(
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
      ? await fetchToolCall({
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

    const resolvedStatus = !isConfirmed
      ? ToolCallStatus.REJECTED
      : executed.isOk
        ? ToolCallStatus.SUCCEEDED
        : ToolCallStatus.FAILED

    await this.agentRuntimeRepository.updateAgentRuntimeToolCall(toolCall.id, {
      status: resolvedStatus,
      output: executed.isOk ? executed.output : null,
      errorMessage: executed.isOk ? null : executed.output,
      latencyMs: executed.latencyMs,
      resolvedAt: new Date(),
    })

    try {
      const result = await this.runLoop(context, [
        ...conversation,
        {
          role: 'tool',
          toolCallId: providerCall.id,
          content: executed.output,
          isError: !executed.isOk,
        },
      ])

      const latencyMs = toolCall.run.latencyMs + (Date.now() - startedAt)
      const inputTokens = toolCall.run.inputTokens + result.inputTokens
      const outputTokens = toolCall.run.outputTokens + result.outputTokens
      const costUsd = getRunCostUsd(version.model, inputTokens, outputTokens)

      await this.agentRuntimeRepository.updateAgentRuntimeRun(toolCall.runId, {
        status: result.status,
        output: result.text,
        inputTokens,
        outputTokens,
        costUsd,
        latencyMs,
      })

      if (toolCall.run.sessionId && result.status === AgentRunStatus.SUCCEEDED) {
        await this.agentRuntimeRepository.postAgentRuntimeMessageMany(
          toolCall.run.sessionId,
          toolCall.run.input,
          result.text
        )
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
            status: resolvedStatus,
            input: providerCall.input,
            output: executed.output,
          },
          ...result.toolCalls,
        ],
        pendingToolCall: result.pending,
      }
    } catch (error) {
      const failure = this.getProviderFailure(error)

      await this.agentRuntimeRepository.updateAgentRuntimeRun(toolCall.runId, {
        status: AgentRunStatus.FAILED,
        errorCode: failure.code,
        errorMessage: failure.message,
      })

      throw new HttpError(failure.status, failure.code, failure.message)
    }
  }

  /**
   * Menjalankan konfigurasi yang belum disimpan.
   *
   * Console memakainya untuk mencoba agent sambil menyusunnya, jadi tidak ada
   * agent, versi, maupun baris run yang dibuat — termasuk tidak ada jejak
   * eksekusi. Yang tetap berlaku: kunci provider diambil dari project yang
   * sama, dan tool tulis tidak dijalankan karena persetujuannya tidak punya
   * tempat disimpan.
   */
  async storeAgentsPreview({
    projectId,
    environment,
    provider,
    model,
    effort,
    maxTokens,
    temperature,
    instructions,
    toolIds,
    documentIds,
    messages,
  }: StoreAgentsPreviewDto): Promise<AgentPreviewResponseDto> {
    const apiKey = await this.getProviderKey(projectId, provider, environment)

    const tools = toolIds.length
      ? await this.agentRuntimeRepository.getAgentRuntimeToolMany(
          projectId,
          toolIds
        )
      : []

    const documents = documentIds.length
      ? await this.agentRuntimeRepository.getAgentRuntimeDocumentMany(
          projectId,
          documentIds
        )
      : []

    const context: LoopContext = {
      runId: null,
      apiKey,
      model,
      provider,
      instructions: this.getSystemPrompt(instructions, documents),
      tools,
      maxTokens,
      effort: getEffortLevel(effort),
      temperature,
    }

    const startedAt = Date.now()

    try {
      const result = await this.runLoop(
        context,
        messages.map((message) => ({
          role: message.role,
          content: message.content,
        }))
      )

      return {
        status: result.status,
        output: result.text,
        stopReason: result.stopReason,
        latencyMs: Date.now() - startedAt,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        costUsd: getRunCostUsd(model, result.inputTokens, result.outputTokens),
        toolCalls: result.toolCalls,
      }
    } catch (error) {
      const failure = this.getProviderFailure(error)

      throw new HttpError(failure.status, failure.code, failure.message)
    }
  }

  // Satu putaran percakapan: model menjawab, atau meminta tool. Tool baca
  // dijalankan langsung; tool tulis berhenti di sini dan menunggu konfirmasi.
  private async runLoop(
    context: LoopContext,
    messages: ProviderMessage[]
  ): Promise<LoopResult> {
    const adapter = getProviderAdapter(context.provider)
    const toolCalls: AgentRunToolCallDto[] = []
    const conversation = [...messages]

    let inputTokens = 0
    let outputTokens = 0

    for (let step = 0; step < MAX_TOOL_STEPS; step += 1) {
      const result = await adapter({
        apiKey: context.apiKey,
        model: context.model,
        instructions: context.instructions,
        messages: conversation,
        tools: this.getProviderTools(context.tools),
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
          toolCalls,
          pending: null,
        }
      }

      conversation.push({
        role: 'assistant',
        content: result.text,
        toolCalls: result.toolCalls,
      })

      const writeCall = result.toolCalls.find(
        (call) =>
          context.tools.find((tool) => tool.name === call.name)?.permission ===
          ToolPermission.WRITE
      )

      if (writeCall) {
        // Tool tulis butuh persetujuan yang tersimpan, dan pratinjau tidak
        // punya tempat menyimpannya. Berhenti di sini dan katakan apa adanya,
        // daripada menjalankan perubahan data tanpa jejak.
        if (!context.runId) {
          return {
            status: AgentRunStatus.PENDING_CONFIRMATION,
            text: result.text,
            stopReason: 'preview_write_blocked',
            inputTokens,
            outputTokens,
            toolCalls: [
              ...toolCalls,
              {
                id: '',
                name: writeCall.name,
                permission: ToolPermission.WRITE,
                status: ToolCallStatus.PENDING_CONFIRMATION,
                input: writeCall.input,
                output:
                  'Tool yang mengubah data tidak dijalankan di pratinjau. Simpan agentnya dulu, lalu jalankan dari Playground.',
              },
            ],
            pending: null,
          }
        }

        const definition = context.tools.find(
          (tool) => tool.name === writeCall.name
        )

        const pending =
          await this.agentRuntimeRepository.postAgentRuntimeToolCall({
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
          })

        return {
          status: AgentRunStatus.PENDING_CONFIRMATION,
          text: result.text,
          stopReason: 'pending_confirmation',
          inputTokens,
          outputTokens,
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
          pending: {
            id: pending.id,
            name: writeCall.name,
            input: writeCall.input,
          },
        }
      }

      for (const call of result.toolCalls) {
        const executed = await this.runToolCall(context, call)

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
      toolCalls,
      pending: null,
    }
  }

  private async runToolCall(context: LoopContext, call: ProviderToolCall) {
    const definition = context.tools.find((tool) => tool.name === call.name)

    if (!definition) {
      const message = 'Tool tidak terpasang pada versi agent ini.'

      return {
        record: {
          id: '',
          name: call.name,
          permission: ToolPermission.READ,
          status: ToolCallStatus.FAILED,
          input: call.input,
          output: message,
        } satisfies AgentRunToolCallDto,
        message: {
          role: 'tool' as const,
          toolCallId: call.id,
          content: message,
          isError: true,
        },
      }
    }

    const executed = await fetchToolCall({
      integration: definition.integration,
      definition,
      input: call.input,
    })

    // Pratinjau tidak punya baris run, jadi pemanggilannya tidak dicatat.
    const record = context.runId
      ? await this.agentRuntimeRepository.postAgentRuntimeToolCall({
          runId: context.runId,
          toolDefinitionId: definition.id,
          name: definition.name,
          permission: definition.permission,
          status: executed.isOk
            ? ToolCallStatus.SUCCEEDED
            : ToolCallStatus.FAILED,
          input: call.input as Prisma.InputJsonValue,
          output: executed.isOk ? executed.output : null,
          errorMessage: executed.isOk ? null : executed.output,
          latencyMs: executed.latencyMs,
          providerCallId: call.id,
          resolvedAt: new Date(),
        })
      : { id: '' }

    return {
      record: {
        id: record.id,
        name: definition.name,
        permission: definition.permission,
        status: executed.isOk ? ToolCallStatus.SUCCEEDED : ToolCallStatus.FAILED,
        input: call.input,
        output: executed.output,
      } satisfies AgentRunToolCallDto,
      message: {
        role: 'tool' as const,
        toolCallId: call.id,
        content: executed.output,
        isError: !executed.isOk,
      },
    }
  }

  private async getProviderKey(
    projectId: string,
    provider: LoopContext['provider'],
    environment: AgentEnvironment
  ) {
    const credential =
      await this.agentRuntimeRepository.getAgentRuntimeCredential(
        projectId,
        provider,
        environment
      )

    if (!credential) {
      throw conflictError(
        'PROVIDER_KEY_MISSING',
        `Project ini belum punya kunci ${provider} untuk environment ${environment}.`
      )
    }

    const secret = decryptSecret(credential.secret)

    if (!secret) {
      throw serviceUnavailableError(
        'CONFIG_MISSING',
        `Kunci provider tidak bisa dibuka. Pastikan ${ENCRYPTION_KEY_ENV} masih kunci yang sama dengan saat kredensialnya disimpan.`
      )
    }

    return secret
  }

  private async getMemory(sessionId: string): Promise<ProviderMessage[]> {
    const messages =
      await this.agentRuntimeRepository.getAgentRuntimeMessageMany(
        sessionId,
        MAX_MEMORY_MESSAGES
      )

    return messages.map((message) => ({
      role: message.role === 'USER' ? 'user' : 'assistant',
      content: message.content,
    }))
  }

  private getSystemPrompt(
    instructions: string,
    documents: { title: string; content: string }[]
  ) {
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

  private getProviderTools(tools: ToolContext[]): ProviderTool[] {
    return tools.map((tool) => ({
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
  }

  private getProviderFailure(error: unknown) {
    return error instanceof ProviderError
      ? error
      : new ProviderError('PROVIDER_FAILED', 'Eksekusi agent gagal.', 502)
  }
}

export const agentRuntimeService = new AgentRuntimeService(agentRuntimeRepository)
