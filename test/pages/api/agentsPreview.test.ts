import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToolPermission } from '@prisma/client'

import { agentsModule } from '@server/features/agents/module'
import { encryptSecret } from '@server/shared/utils/crypto.util'
import { resetRateLimit } from '@server/shared/services/rateLimit.service'
import { getTestRequest, getTestResponse, muteLogger } from '../../helpers/apiTest'

const handler = agentsModule.preview

const { adapterMock, toolFetchMock, prismaMock } = vi.hoisted(() => ({
  adapterMock: vi.fn(),
  toolFetchMock: vi.fn(),
  prismaMock: {
    providerCredential: { findUnique: vi.fn() },
    toolDefinition: { findMany: vi.fn() },
    knowledgeDocument: { findMany: vi.fn() },
    agentRun: { create: vi.fn(), update: vi.fn() },
    agentToolCall: { create: vi.fn() },
  },
}))

vi.mock('@server/shared/prisma.service', () => ({ prismaService: prismaMock }))
vi.mock('@server/shared/services/providers', () => ({
  getProviderAdapter: () => adapterMock,
}))
vi.mock('@server/shared/services/toolExecutor.service', () => ({
  fetchToolCall: toolFetchMock,
}))

const ADMIN_TOKEN = 'token-pengelolaan-uji'

const getBody = (overrides: Record<string, unknown> = {}) => ({
  projectId: 'project-1',
  provider: 'ANTHROPIC',
  model: 'claude-opus-5',
  effort: 'HIGH',
  maxTokens: 16_000,
  temperature: null,
  instructions: 'Jawab hanya dari hasil tool.',
  toolIds: [],
  documentIds: [],
  messages: [{ role: 'user', content: 'berapa laba bulan lalu?' }],
  ...overrides,
})

const call = async ({
  token = ADMIN_TOKEN,
  body,
  method = 'POST',
}: {
  token?: string
  body?: unknown
  method?: string
}) => {
  const res = getTestResponse()

  await handler(
    getTestRequest({
      method,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      query: {},
      body,
    }) as never,
    res as never
  )

  return res
}

const getTool = (permission: ToolPermission) => ({
  id: 'tool-1',
  name: 'get_profit_loss',
  description: 'Ambil laba rugi',
  permission,
  inputSchema: { type: 'object', properties: {} },
  integration: {
    id: 'integration-1',
    projectId: 'project-1',
    baseUrl: 'https://contoh.test',
  },
})

beforeEach(async () => {
  muteLogger()
  await resetRateLimit()

  process.env.BLAYER_ADMIN_TOKEN = ADMIN_TOKEN
  process.env.BLAYER_ENCRYPTION_KEY = Buffer.alloc(32, 3).toString('base64')

  prismaMock.providerCredential.findUnique = vi.fn().mockResolvedValue({
    id: 'credential-1',
    secret: encryptSecret('sk-ant-rahasia'),
  })
  prismaMock.toolDefinition.findMany = vi.fn().mockResolvedValue([])
  prismaMock.knowledgeDocument.findMany = vi.fn().mockResolvedValue([])
  prismaMock.agentRun.create = vi.fn().mockResolvedValue({ id: 'run-1' })
  prismaMock.agentRun.update = vi.fn().mockResolvedValue({})
  prismaMock.agentToolCall.create = vi.fn().mockResolvedValue({ id: 'tool-call-1' })

  toolFetchMock.mockReset()
  toolFetchMock.mockResolvedValue({
    isOk: true,
    output: '{"profit": 12000000}',
    latencyMs: 12,
  })

  adapterMock.mockReset()
  adapterMock.mockResolvedValue({
    text: 'laba bulan lalu 12 juta',
    toolCalls: [],
    inputTokens: 1_000,
    outputTokens: 500,
    stopReason: 'end_turn',
  })
})

describe('pratinjau agent', () => {
  it('TC-88a menjalankan konfigurasi yang belum disimpan tanpa membuat agent', async () => {
    const res = await call({ body: getBody() })

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toMatchObject({ output: 'laba bulan lalu 12 juta' })
    expect(prismaMock.agentRun.create).not.toHaveBeenCalled()
  })

  it('TC-88b memakai instruksi dan model yang sedang disusun', async () => {
    await call({
      body: getBody({ instructions: 'Balas dalam satu kalimat.', model: 'claude-sonnet-5' }),
    })

    const sent = adapterMock.mock.calls[0]?.[0]

    expect(sent.model).toBe('claude-sonnet-5')
    expect(sent.instructions).toContain('Balas dalam satu kalimat.')
  })

  it('TC-88c meneruskan seluruh percakapan supaya pratinjau nyambung', async () => {
    await call({
      body: getBody({
        messages: [
          { role: 'user', content: 'halo' },
          { role: 'assistant', content: 'halo juga' },
          { role: 'user', content: 'berapa labanya?' },
        ],
      }),
    })

    expect(adapterMock.mock.calls[0]?.[0].messages).toHaveLength(3)
  })

  it('TC-88d menjalankan tool baca seperti eksekusi biasa, tanpa mencatatnya', async () => {
    prismaMock.toolDefinition.findMany = vi
      .fn()
      .mockResolvedValue([getTool(ToolPermission.READ)])

    adapterMock
      .mockResolvedValueOnce({
        text: '',
        toolCalls: [{ id: 'call-1', name: 'get_profit_loss', input: {} }],
        inputTokens: 100,
        outputTokens: 50,
        stopReason: 'tool_use',
      })
      .mockResolvedValueOnce({
        text: 'labanya 12 juta',
        toolCalls: [],
        inputTokens: 100,
        outputTokens: 50,
        stopReason: 'end_turn',
      })

    const res = await call({ body: getBody({ toolIds: ['tool-1'] }) })

    expect(res.statusCode).toBe(200)
    expect(toolFetchMock).toHaveBeenCalled()
    expect(prismaMock.agentToolCall.create).not.toHaveBeenCalled()
  })

  it('TC-88e menolak menjalankan tool tulis karena konfirmasinya tidak punya tempat', async () => {
    prismaMock.toolDefinition.findMany = vi
      .fn()
      .mockResolvedValue([getTool(ToolPermission.WRITE)])

    adapterMock.mockResolvedValue({
      text: 'saya akan mengubah datanya',
      toolCalls: [{ id: 'call-1', name: 'get_profit_loss', input: {} }],
      inputTokens: 100,
      outputTokens: 50,
      stopReason: 'tool_use',
    })

    const res = await call({ body: getBody({ toolIds: ['tool-1'] }) })

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toMatchObject({ stopReason: 'preview_write_blocked' })
    expect(toolFetchMock).not.toHaveBeenCalled()
    expect(prismaMock.agentToolCall.create).not.toHaveBeenCalled()
  })

  it('TC-88f hanya memakai tool milik project yang sama', async () => {
    await call({ body: getBody({ toolIds: ['tool-1'] }) })

    expect(prismaMock.toolDefinition.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          integration: { projectId: 'project-1' },
        }),
      })
    )
  })

  it('TC-88g menolak pemanggil tanpa sesi pengelolaan', async () => {
    const res = await call({ token: '', body: getBody() })

    expect(res.statusCode).toBe(401)
  })

  it('TC-88h menolak percakapan kosong', async () => {
    const res = await call({ body: getBody({ messages: [] }) })

    expect(res.statusCode).toBe(422)
    expect(res.body.error?.code).toBe('VALIDATION_ERROR')
  })

  it('TC-88i menolak model di luar katalog providernya', async () => {
    const res = await call({ body: getBody({ model: 'gpt-4o' }) })

    expect(res.statusCode).toBe(422)
    expect(res.body.error?.details).toHaveProperty('model')
  })

  it('TC-88j menjawab 409 saat project belum punya kunci provider', async () => {
    prismaMock.providerCredential.findUnique = vi.fn().mockResolvedValue(null)

    const res = await call({ body: getBody() })

    expect(res.statusCode).toBe(409)
    expect(res.body.error?.code).toBe('PROVIDER_KEY_MISSING')
  })
})
