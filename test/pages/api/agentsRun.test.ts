import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentEffort, AgentEnvironment, AgentProvider } from '@prisma/client'

import { agentsModule } from '@server/features/agents/module'

import { encryptSecret } from '@server/shared/utils/crypto.util'
import { ProviderError } from '@server/shared/services/providers/provider.types'
import { resetRateLimit } from '@server/shared/services/rateLimit.service'
import { getTestRequest, getTestResponse, muteLogger } from '../../helpers/apiTest'

const handler = agentsModule.run

const { adapterMock, prismaMock } = vi.hoisted(() => ({
  adapterMock: vi.fn(),
  prismaMock: {
    agent: { findUnique: vi.fn() },
    agentVersion: { findFirst: vi.fn() },
    agentSession: { findFirst: vi.fn() },
    agentMessage: { findMany: vi.fn(), createMany: vi.fn() },
    agentToolCall: { create: vi.fn() },
    providerCredential: { findUnique: vi.fn() },
    agentRun: { create: vi.fn(), update: vi.fn() },
    projectApiKey: { findUnique: vi.fn(), update: vi.fn() },
  },
}))

vi.mock('@server/shared/prisma.service', () => ({ prismaService: prismaMock }))
vi.mock('@server/shared/services/providers', () => ({
  getProviderAdapter: () => adapterMock,
}))

const ADMIN_TOKEN = 'token-pengelolaan-uji'
const PROJECT_TOKEN = 'blr_kunci-project-uji'

const getVersion = (overrides: Record<string, unknown> = {}) => ({
  id: 'version-1',
  agentId: 'agent-1',
  version: 3,
  instructions: 'Jawab hanya dari hasil tool.',
  provider: AgentProvider.ANTHROPIC,
  model: 'claude-opus-5',
  effort: AgentEffort.HIGH,
  maxTokens: 16_000,
  temperature: null,
  tools: [],
  documents: [],
  ...overrides,
})

const call = async ({
  token,
  body,
  method = 'POST',
  agentId = 'agent-1',
}: {
  token?: string
  body?: unknown
  method?: string
  agentId?: string
}) => {
  const res = getTestResponse()

  await handler(
    getTestRequest({
      method,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      query: { agentId },
      body,
    }) as never,
    res as never
  )

  return res
}

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
  prismaMock.agentVersion.findFirst = vi
    .fn()
    .mockImplementation(({ where }: { where: { id: string } }) =>
      Promise.resolve(
        where.id === 'version-2'
          ? getVersion({ id: 'version-2', version: 4 })
          : getVersion()
      )
    )
  prismaMock.agentSession.findFirst = vi.fn().mockResolvedValue(null)
  prismaMock.agentMessage.findMany = vi.fn().mockResolvedValue([])
  prismaMock.agentMessage.createMany = vi.fn().mockResolvedValue({})
  prismaMock.agentToolCall.create = vi.fn().mockResolvedValue({ id: 'tool-call-1' })
  prismaMock.agentRun.update = vi.fn().mockResolvedValue({})
  prismaMock.providerCredential.findUnique = vi.fn().mockResolvedValue({
    id: 'credential-1',
    secret: encryptSecret('sk-ant-rahasia'),
  })
  prismaMock.agentRun.create = vi.fn().mockResolvedValue({ id: 'run-1' })
  prismaMock.projectApiKey.findUnique = vi.fn().mockResolvedValue({
    id: 'key-1',
    projectId: 'project-1',
    environment: AgentEnvironment.PRODUCTION,
    revokedAt: null,
  })
  prismaMock.projectApiKey.update = vi.fn().mockResolvedValue({})

  adapterMock.mockReset()
  adapterMock.mockResolvedValue({
    text: 'laba bulan lalu 12 juta',
    toolCalls: [],
    inputTokens: 1_000,
    outputTokens: 500,
    stopReason: 'end_turn',
  })
})

describe('kepemilikan rute eksekusi agent', () => {
  it('TC-60a menolak permintaan tanpa kredensial', async () => {
    const res = await call({})

    expect(res.statusCode).toBe(401)
    expect(res.body.error?.code).toBe('UNAUTHORIZED')
  })

  it('TC-60b menolak API key yang tidak dikenal', async () => {
    prismaMock.projectApiKey.findUnique = vi.fn().mockResolvedValue(null)

    const res = await call({ token: 'blr_bukan-kunci', body: { input: 'halo' } })

    expect(res.statusCode).toBe(401)
  })

  it('TC-60c menolak API key yang sudah dicabut', async () => {
    prismaMock.projectApiKey.findUnique = vi.fn().mockResolvedValue({
      id: 'key-1',
      projectId: 'project-1',
      environment: AgentEnvironment.PRODUCTION,
      revokedAt: new Date(),
    })

    const res = await call({ token: PROJECT_TOKEN, body: { input: 'halo' } })

    expect(res.statusCode).toBe(401)
  })

  it('TC-60d menyamarkan agent milik project lain sebagai tidak ada', async () => {
    prismaMock.agent.findUnique = vi.fn().mockResolvedValue({
      id: 'agent-1',
      projectId: 'project-lain',
      productionVersionId: 'version-1',
    })

    const res = await call({ token: PROJECT_TOKEN, body: { input: 'halo' } })

    expect(res.statusCode).toBe(404)
    expect(res.body.error?.code).toBe('AGENT_NOT_FOUND')
  })

  it('TC-60e melarang kunci project memilih versi sendiri', async () => {
    const res = await call({
      token: PROJECT_TOKEN,
      body: { input: 'halo', versionId: 'version-2' },
    })

    expect(res.statusCode).toBe(403)
    expect(res.body.error?.code).toBe('VERSION_NOT_ALLOWED')
    expect(adapterMock).not.toHaveBeenCalled()
  })

  it('TC-60f menolak method selain POST', async () => {
    const res = await call({ token: PROJECT_TOKEN, method: 'GET' })

    expect(res.statusCode).toBe(405)
  })
})

describe('eksekusi agent', () => {
  it('TC-61a menjalankan versi production di environment milik kuncinya', async () => {
    const res = await call({ token: PROJECT_TOKEN, body: { input: 'berapa laba?' } })

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toMatchObject({
      runId: 'run-1',
      version: 3,
      environment: AgentEnvironment.PRODUCTION,
      output: 'laba bulan lalu 12 juta',
      inputTokens: 1_000,
      outputTokens: 500,
    })

    expect(prismaMock.providerCredential.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          projectId_provider_environment: {
            projectId: 'project-1',
            provider: AgentProvider.ANTHROPIC,
            environment: AgentEnvironment.PRODUCTION,
          },
        },
      })
    )
  })

  it('TC-61b membuka kredensial provider sebelum meneruskannya ke adaptor', async () => {
    await call({ token: PROJECT_TOKEN, body: { input: 'berapa laba?' } })

    expect(adapterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'sk-ant-rahasia',
        model: 'claude-opus-5',
        effort: 'high',
        messages: [{ role: 'user', content: 'berapa laba?' }],
        tools: [],
      })
    )

    // Instruksi agent tetap utuh, dengan guardrail ditambahkan di belakangnya.
    const { instructions } = adapterMock.mock.calls[0][0]
    expect(instructions).toContain('Jawab hanya dari hasil tool.')
    expect(instructions).toContain('Jangan mengarang angka')
  })

  it('TC-61c menghitung biaya dari harga model yang benar-benar dipakai', async () => {
    const res = await call({ token: PROJECT_TOKEN, body: { input: 'berapa laba?' } })

    // Opus 5: (1000/1jt x $5) + (500/1jt x $25) = $0.0175
    expect(res.body.data).toMatchObject({ costUsd: 0.0175 })
    expect(prismaMock.agentRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SUCCEEDED', costUsd: 0.0175 }),
      })
    )
  })

  it('TC-61d membiarkan operator menguji versi tertentu lewat token pengelolaan', async () => {
    const res = await call({
      token: ADMIN_TOKEN,
      body: {
        input: 'berapa laba?',
        versionId: 'version-2',
        environment: AgentEnvironment.DEVELOPMENT,
      },
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toMatchObject({ version: 4, environment: 'DEVELOPMENT' })
    expect(prismaMock.agentVersion.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'version-2', agentId: 'agent-1' } })
    )
  })

  it('TC-61e menolak menjalankan agent yang belum punya versi production', async () => {
    prismaMock.agent.findUnique = vi.fn().mockResolvedValue({
      id: 'agent-1',
      projectId: 'project-1',
      productionVersionId: null,
    })

    const res = await call({ token: PROJECT_TOKEN, body: { input: 'halo' } })

    expect(res.statusCode).toBe(409)
    expect(res.body.error?.code).toBe('AGENT_NOT_PUBLISHED')
    expect(prismaMock.agentRun.create).not.toHaveBeenCalled()
  })

  it('TC-61f menyebut kredensial provider yang belum ada, bukan gagal diam-diam', async () => {
    prismaMock.providerCredential.findUnique = vi.fn().mockResolvedValue(null)

    const res = await call({ token: PROJECT_TOKEN, body: { input: 'halo' } })

    expect(res.statusCode).toBe(409)
    expect(res.body.error?.code).toBe('PROVIDER_KEY_MISSING')
  })

  it('TC-61g menolak melanjutkan kalau kunci enkripsinya sudah berganti', async () => {
    process.env.BLAYER_ENCRYPTION_KEY = Buffer.alloc(32, 8).toString('base64')

    const res = await call({ token: PROJECT_TOKEN, body: { input: 'halo' } })

    expect(res.statusCode).toBe(503)
    expect(res.body.error?.code).toBe('CONFIG_MISSING')
  })

  it('TC-61h mencatat eksekusi yang gagal, bukan hanya yang berhasil', async () => {
    adapterMock.mockRejectedValue(
      new ProviderError('AGENT_REFUSED', 'Model menolak permintaan ini.', 422)
    )

    const res = await call({ token: PROJECT_TOKEN, body: { input: 'halo' } })

    expect(res.statusCode).toBe(422)
    expect(res.body.error?.code).toBe('AGENT_REFUSED')
    expect(prismaMock.agentRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'FAILED',
          errorCode: 'AGENT_REFUSED',
        }),
      })
    )
  })

  it('TC-61i menolak masukan kosong sebelum memanggil provider', async () => {
    const res = await call({ token: PROJECT_TOKEN, body: { input: '   ' } })

    expect(res.statusCode).toBe(422)
    expect(adapterMock).not.toHaveBeenCalled()
  })
})
