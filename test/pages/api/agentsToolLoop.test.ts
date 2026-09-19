import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AgentEffort,
  AgentEnvironment,
  AgentProvider,
  IntegrationAuth,
  ToolMethod,
  ToolPermission,
} from '@prisma/client'

import { agentsModule } from '@server/features/agents/module'
import { runsModule } from '@server/features/runs/module'

import { encryptSecret } from '@server/shared/utils/crypto.util'
import { resetRateLimit } from '@server/shared/services/rateLimit.service'
import { getTestRequest, getTestResponse, muteLogger } from '../../helpers/apiTest'

const runHandler = agentsModule.run
const confirmHandler = runsModule.confirm

const { adapterMock, executeToolMock, prismaMock } = vi.hoisted(() => ({
  adapterMock: vi.fn(),
  executeToolMock: vi.fn(),
  prismaMock: {
    agent: { findUnique: vi.fn() },
    agentVersion: { findFirst: vi.fn(), findUnique: vi.fn() },
    agentSession: { findFirst: vi.fn(), update: vi.fn() },
    agentMessage: { findMany: vi.fn(), createMany: vi.fn() },
    agentToolCall: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    providerCredential: { findUnique: vi.fn() },
    agentRun: { create: vi.fn(), update: vi.fn() },
    projectApiKey: { findUnique: vi.fn(), update: vi.fn() },
  },
}))

vi.mock('@server/shared/prisma.service', () => ({ prismaService: prismaMock }))
vi.mock('@server/shared/services/providers', () => ({
  getProviderAdapter: () => adapterMock,
}))
vi.mock('@server/shared/services/toolExecutor.service', () => ({
  fetchToolCall: executeToolMock,
}))

const ADMIN_TOKEN = 'token-pengelolaan-uji'

const INTEGRATION = {
  id: 'integration-1',
  projectId: 'project-1',
  baseUrl: 'https://app.easyaccounting.test/api',
  auth: IntegrationAuth.NONE,
  authHeader: null,
  secret: null,
}

const READ_TOOL = {
  id: 'tool-read',
  integrationId: 'integration-1',
  name: 'get_profit_loss',
  description: 'Ambil laporan laba rugi.',
  method: ToolMethod.GET,
  path: '/ai/tools/profit-loss',
  permission: ToolPermission.READ,
  inputSchema: { type: 'object', properties: { month: { type: 'string' } } },
  integration: INTEGRATION,
}

const WRITE_TOOL = {
  ...READ_TOOL,
  id: 'tool-write',
  name: 'delete_transaction',
  description: 'Hapus transaksi.',
  method: ToolMethod.DELETE,
  path: '/ai/tools/transactions/{id}',
  permission: ToolPermission.WRITE,
}

const getVersion = (tools: unknown[] = []) => ({
  id: 'version-1',
  agentId: 'agent-1',
  version: 3,
  instructions: 'Jawab hanya dari hasil tool.',
  provider: AgentProvider.ANTHROPIC,
  model: 'claude-opus-5',
  effort: AgentEffort.HIGH,
  maxTokens: 16_000,
  temperature: null,
  tools: tools.map((toolDefinition) => ({ toolDefinition })),
  documents: [],
})

const call = async (
  handler: typeof runHandler,
  query: Record<string, string>,
  body: unknown
) => {
  const res = getTestResponse()

  await handler(
    getTestRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
      query,
      body,
    }) as never,
    res as never
  )

  return res
}

const runAgent = (body: unknown) =>
  call(runHandler, { agentId: 'agent-1' }, body)

beforeEach(async () => {
  muteLogger()
  await resetRateLimit()

  process.env.BLAYER_ADMIN_TOKEN = ADMIN_TOKEN
  process.env.BLAYER_ENCRYPTION_KEY = Buffer.alloc(32, 3).toString('base64')

  prismaMock.agent.findUnique = vi.fn().mockResolvedValue({
    id: 'agent-1',
    projectId: 'project-1',
    productionVersionId: 'version-1',
  })
  prismaMock.agentVersion.findFirst = vi.fn().mockResolvedValue(getVersion([READ_TOOL]))
  prismaMock.agentVersion.findUnique = vi.fn().mockResolvedValue(getVersion([WRITE_TOOL]))
  prismaMock.agentSession.findFirst = vi.fn().mockResolvedValue(null)
  prismaMock.agentMessage.findMany = vi.fn().mockResolvedValue([])
  prismaMock.agentMessage.createMany = vi.fn().mockResolvedValue({})
  prismaMock.agentToolCall.create = vi
    .fn()
    .mockResolvedValue({ id: 'tool-call-1' })
  prismaMock.agentToolCall.update = vi.fn().mockResolvedValue({})
  prismaMock.providerCredential.findUnique = vi.fn().mockResolvedValue({
    id: 'credential-1',
    secret: encryptSecret('sk-ant-rahasia'),
  })
  prismaMock.agentRun.create = vi.fn().mockResolvedValue({ id: 'run-1' })
  prismaMock.agentRun.update = vi.fn().mockResolvedValue({})

  adapterMock.mockReset()
  executeToolMock.mockReset()
  executeToolMock.mockResolvedValue({
    isOk: true,
    output: '{"laba":12000000}',
    latencyMs: 40,
  })
})

describe('tool baca', () => {
  it('TC-77a menjalankan toolnya lalu menjawab dari hasilnya', async () => {
    adapterMock
      .mockResolvedValueOnce({
        text: 'sebentar',
        toolCalls: [
          { id: 'call-1', name: 'get_profit_loss', input: { month: '2026-08' } },
        ],
        inputTokens: 100,
        outputTokens: 20,
        stopReason: 'tool_use',
      })
      .mockResolvedValueOnce({
        text: 'Laba bulan lalu Rp12.000.000.',
        toolCalls: [],
        inputTokens: 300,
        outputTokens: 40,
        stopReason: 'end_turn',
      })

    const res = await runAgent({ input: 'berapa laba bulan lalu?' })

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toMatchObject({
      status: 'SUCCEEDED',
      output: 'Laba bulan lalu Rp12.000.000.',
      inputTokens: 400,
      outputTokens: 60,
    })

    expect(executeToolMock).toHaveBeenCalledWith(
      expect.objectContaining({ input: { month: '2026-08' } })
    )

    // Putaran kedua membawa hasil tool sebagai pesan tool, bukan teks biasa.
    expect(adapterMock.mock.calls[1][0].messages).toEqual([
      { role: 'user', content: 'berapa laba bulan lalu?' },
      {
        role: 'assistant',
        content: 'sebentar',
        toolCalls: [
          { id: 'call-1', name: 'get_profit_loss', input: { month: '2026-08' } },
        ],
      },
      {
        role: 'tool',
        toolCallId: 'call-1',
        content: '{"laba":12000000}',
        isError: false,
      },
    ])
  })

  it('TC-77b meneruskan kegagalan endpoint ke model, bukan menjatuhkan eksekusi', async () => {
    executeToolMock.mockResolvedValue({
      isOk: false,
      output: 'Endpoint tool menjawab 500.',
      latencyMs: 12,
    })

    adapterMock
      .mockResolvedValueOnce({
        text: '',
        toolCalls: [{ id: 'call-1', name: 'get_profit_loss', input: {} }],
        inputTokens: 10,
        outputTokens: 5,
        stopReason: 'tool_use',
      })
      .mockResolvedValueOnce({
        text: 'Maaf, laporannya sedang tidak bisa diambil.',
        toolCalls: [],
        inputTokens: 10,
        outputTokens: 5,
        stopReason: 'end_turn',
      })

    const res = await runAgent({ input: 'berapa laba?' })

    expect(res.statusCode).toBe(200)
    expect(adapterMock.mock.calls[1][0].messages.at(-1)).toMatchObject({
      role: 'tool',
      isError: true,
    })
    expect(prismaMock.agentToolCall.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' }),
      })
    )
  })

  it('TC-77c mengirim kontrak tool yang terpasang ke provider', async () => {
    adapterMock.mockResolvedValue({
      text: 'halo',
      toolCalls: [],
      inputTokens: 1,
      outputTokens: 1,
      stopReason: 'end_turn',
    })

    await runAgent({ input: 'halo' })

    expect(adapterMock.mock.calls[0][0].tools).toEqual([
      {
        name: 'get_profit_loss',
        description: 'Ambil laporan laba rugi.',
        inputSchema: {
          type: 'object',
          properties: { month: { type: 'string' } },
        },
      },
    ])
  })
})

describe('tool tulis', () => {
  beforeEach(() => {
    prismaMock.agentVersion.findFirst = vi
      .fn()
      .mockResolvedValue(getVersion([WRITE_TOOL]))
  })

  it('TC-78a berhenti menunggu konfirmasi dan tidak menjalankan toolnya', async () => {
    adapterMock.mockResolvedValue({
      text: 'Saya akan menghapus transaksi INV-1.',
      toolCalls: [
        { id: 'call-1', name: 'delete_transaction', input: { id: 'INV-1' } },
      ],
      inputTokens: 50,
      outputTokens: 10,
      stopReason: 'tool_use',
    })

    const res = await runAgent({ input: 'hapus transaksi INV-1' })

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toMatchObject({
      status: 'PENDING_CONFIRMATION',
      pendingToolCall: {
        id: 'tool-call-1',
        name: 'delete_transaction',
        input: { id: 'INV-1' },
      },
    })

    expect(executeToolMock).not.toHaveBeenCalled()
    expect(prismaMock.agentToolCall.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PENDING_CONFIRMATION',
          permission: 'WRITE',
        }),
      })
    )
    expect(prismaMock.agentRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PENDING_CONFIRMATION' }),
      })
    )
  })

  it('TC-78b memberi tahu model bahwa tool tulis butuh konfirmasi', async () => {
    adapterMock.mockResolvedValue({
      text: 'baik',
      toolCalls: [],
      inputTokens: 1,
      outputTokens: 1,
      stopReason: 'end_turn',
    })

    await runAgent({ input: 'halo' })

    expect(adapterMock.mock.calls[0][0].tools[0].description).toContain(
      'butuh konfirmasi manusia'
    )
  })
})

describe('konfirmasi tool tulis', () => {
  const PENDING_CALL = {
    id: 'tool-call-1',
    runId: 'run-1',
    name: 'delete_transaction',
    permission: ToolPermission.WRITE,
    status: 'PENDING_CONFIRMATION',
    input: { id: 'INV-1' },
    providerCallId: 'call-1',
    state: {
      messages: [
        { role: 'user', content: 'hapus transaksi INV-1' },
        {
          role: 'assistant',
          content: 'Saya akan menghapus transaksi INV-1.',
          toolCalls: [
            { id: 'call-1', name: 'delete_transaction', input: { id: 'INV-1' } },
          ],
        },
      ],
      toolCall: {
        id: 'call-1',
        name: 'delete_transaction',
        input: { id: 'INV-1' },
      },
    },
    toolDefinition: WRITE_TOOL,
    run: {
      id: 'run-1',
      projectId: 'project-1',
      agentId: 'agent-1',
      agentVersionId: 'version-1',
      environment: AgentEnvironment.DEVELOPMENT,
      input: 'hapus transaksi INV-1',
      inputTokens: 50,
      outputTokens: 10,
      latencyMs: 900,
      sessionId: null,
      agent: { id: 'agent-1', projectId: 'project-1' },
    },
  }

  beforeEach(() => {
    prismaMock.agentToolCall.findFirst = vi.fn().mockResolvedValue(PENDING_CALL)
    adapterMock.mockResolvedValue({
      text: 'Transaksi INV-1 sudah dihapus.',
      toolCalls: [],
      inputTokens: 20,
      outputTokens: 10,
      stopReason: 'end_turn',
    })
  })

  const confirm = (decision: string) =>
    call(confirmHandler, { runId: 'run-1' }, { toolCallId: 'tool-call-1', decision })

  it('TC-79a menjalankan tool setelah dikonfirmasi lalu melanjutkan jawabannya', async () => {
    executeToolMock.mockResolvedValue({ isOk: true, output: 'deleted', latencyMs: 30 })

    const res = await confirm('CONFIRM')

    expect(res.statusCode).toBe(200)
    expect(executeToolMock).toHaveBeenCalledWith(
      expect.objectContaining({ input: { id: 'INV-1' } })
    )
    expect(res.body.data).toMatchObject({
      status: 'SUCCEEDED',
      output: 'Transaksi INV-1 sudah dihapus.',
      // Token dari sebelum konfirmasi ikut terhitung, bukan direset.
      inputTokens: 70,
      outputTokens: 20,
    })
    expect(prismaMock.agentToolCall.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SUCCEEDED' }),
      })
    )
  })

  it('TC-79b tidak menjalankan tool saat ditolak, tapi tetap menutup eksekusinya', async () => {
    const res = await confirm('REJECT')

    expect(res.statusCode).toBe(200)
    expect(executeToolMock).not.toHaveBeenCalled()
    expect(prismaMock.agentToolCall.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'REJECTED' }),
      })
    )
    expect(adapterMock.mock.calls[0][0].messages.at(-1)).toMatchObject({
      role: 'tool',
      isError: true,
    })
  })

  it('TC-79c menolak konfirmasi yang sudah pernah diputuskan', async () => {
    prismaMock.agentToolCall.findFirst = vi
      .fn()
      .mockResolvedValue({ ...PENDING_CALL, status: 'SUCCEEDED' })

    const res = await confirm('CONFIRM')

    expect(res.statusCode).toBe(409)
    expect(res.body.error?.code).toBe('TOOL_CALL_RESOLVED')
    expect(executeToolMock).not.toHaveBeenCalled()
  })

  it('TC-79d menolak keputusan yang tidak dikenal', async () => {
    const res = await confirm('MUNGKIN')

    expect(res.statusCode).toBe(422)
    expect(Object.keys(res.body.error?.details ?? {})).toContain('decision')
  })

  it('TC-79e menyamarkan konfirmasi milik project lain sebagai tidak ada', async () => {
    prismaMock.projectApiKey.findUnique = vi.fn().mockResolvedValue({
      id: 'key-1',
      projectId: 'project-lain',
      environment: AgentEnvironment.PRODUCTION,
      revokedAt: null,
    })

    const res = getTestResponse()
    await confirmHandler(
      getTestRequest({
        method: 'POST',
        headers: { authorization: 'Bearer blr_kunci-project' },
        query: { runId: 'run-1' },
        body: { toolCallId: 'tool-call-1', decision: 'CONFIRM' },
      }) as never,
      res as never
    )

    expect(res.statusCode).toBe(404)
    expect(res.body.error?.code).toBe('TOOL_CALL_NOT_FOUND')
  })
})
