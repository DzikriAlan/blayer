import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentEffort, AgentProvider } from '@prisma/client'

import versionsHandler from '@/pages/api/v1/agents/[agentId]/versions'
import publishHandler from '@/pages/api/v1/agents/[agentId]/publish'
import { createAdminSession } from '@/server/shared/utils/session.util'
import { getTestRequest, getTestResponse, muteLogger } from '../../helpers/apiTest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    agent: { findUnique: vi.fn(), update: vi.fn() },
    agentVersion: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/server/shared/prisma.service', () => ({ prismaService: prismaMock }))

const ADMIN_TOKEN = 'token-pengelolaan-uji'

const VALID_CONFIG = {
  instructions: 'Jawab hanya dari hasil tool, jangan mengarang angka.',
  provider: AgentProvider.ANTHROPIC,
  model: 'claude-opus-5',
  effort: AgentEffort.HIGH,
  maxTokens: 16_000,
  temperature: null,
}

const call = async (
  handler: typeof versionsHandler,
  {
    token = ADMIN_TOKEN,
    method = 'POST',
    body,
    agentId = 'agent-1',
  }: { token?: string; method?: string; body?: unknown; agentId?: string } = {}
) => {
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

beforeEach(() => {
  muteLogger()
  process.env.BLAYER_ADMIN_TOKEN = ADMIN_TOKEN

  prismaMock.agent.findUnique = vi
    .fn()
    .mockResolvedValue({ id: 'agent-1', productionVersionId: 'version-1' })
  prismaMock.agent.update = vi.fn().mockResolvedValue({})
  prismaMock.agentVersion.findFirst = vi
    .fn()
    .mockResolvedValue({ id: 'version-2', version: 2 })
  prismaMock.agentVersion.create = vi
    .fn()
    .mockResolvedValue({ id: 'version-3', version: 3, status: 'DRAFT' })
  prismaMock.agentVersion.findMany = vi.fn().mockResolvedValue([])
  prismaMock.$transaction = vi.fn().mockResolvedValue([])
})

describe('gerbang rute pengelolaan', () => {
  it('TC-62a menolak permintaan tanpa kredensial apa pun', async () => {
    const res = await call(versionsHandler, { token: '', body: VALID_CONFIG })

    expect(res.statusCode).toBe(401)
    expect(res.body.error?.code).toBe('UNAUTHORIZED')
    expect(prismaMock.agentVersion.create).not.toHaveBeenCalled()
  })

  it('TC-62b menolak token yang salah', async () => {
    const res = await call(versionsHandler, {
      token: 'token-salah',
      body: VALID_CONFIG,
    })

    expect(res.statusCode).toBe(401)
  })

  it('TC-62d menerima sesi hasil login, bukan hanya token mentah', async () => {
    delete process.env.BLAYER_ADMIN_TOKEN

    const res = await call(versionsHandler, {
      token: createAdminSession('admin').token,
      body: VALID_CONFIG,
    })

    expect(res.statusCode).toBe(201)
  })

  it('TC-62c menolak agent yang tidak ada', async () => {
    prismaMock.agent.findUnique = vi.fn().mockResolvedValue(null)

    const res = await call(versionsHandler, { body: VALID_CONFIG })

    expect(res.statusCode).toBe(404)
    expect(res.body.error?.code).toBe('AGENT_NOT_FOUND')
  })
})

describe('versi agent', () => {
  it('TC-63a menyimpan perubahan sebagai draf bernomor berikutnya', async () => {
    prismaMock.agentVersion.findFirst = vi.fn().mockResolvedValue({ version: 7 })

    const res = await call(versionsHandler, { body: VALID_CONFIG })

    expect(res.statusCode).toBe(201)
    expect(prismaMock.agentVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: 8, status: 'DRAFT' }),
      })
    )
  })

  it('TC-63b memulai dari versi 1 saat agent belum punya versi', async () => {
    prismaMock.agentVersion.findFirst = vi.fn().mockResolvedValue(null)

    await call(versionsHandler, { body: VALID_CONFIG })

    expect(prismaMock.agentVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ version: 1 }) })
    )
  })

  it('TC-63c tidak menyentuh versi yang sedang melayani production', async () => {
    await call(versionsHandler, { body: VALID_CONFIG })

    expect(prismaMock.agentVersion.update).not.toHaveBeenCalled()
    expect(prismaMock.agent.update).not.toHaveBeenCalled()
  })

  it('TC-63d menolak konfigurasi yang modelnya tidak dikenal', async () => {
    const res = await call(versionsHandler, {
      body: { ...VALID_CONFIG, model: 'claude-tidak-ada' },
    })

    expect(res.statusCode).toBe(422)
    expect(Object.keys(res.body.error?.details ?? {})).toContain('model')
    expect(prismaMock.agentVersion.create).not.toHaveBeenCalled()
  })

  it('TC-63e menandai versi yang sedang production saat daftarnya dibaca', async () => {
    prismaMock.agentVersion.findMany = vi.fn().mockResolvedValue([
      {
        ...VALID_CONFIG,
        id: 'version-2',
        version: 2,
        status: 'DRAFT',
        publishedAt: null,
        createdAt: new Date(),
        tools: [],
        documents: [],
      },
      {
        ...VALID_CONFIG,
        id: 'version-1',
        version: 1,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        createdAt: new Date(),
        tools: [{ toolDefinitionId: 'tool-1' }],
        documents: [],
      },
    ])

    const res = await call(versionsHandler, { method: 'GET' })
    const versions = res.body.data as { id: string; isProduction: boolean }[]

    expect(versions.find((version) => version.id === 'version-1')?.isProduction).toBe(true)
    expect(versions.find((version) => version.id === 'version-2')?.isProduction).toBe(false)
  })
})

describe('publikasi versi', () => {
  it('TC-64a memindahkan production ke versi yang dipilih dan mengarsipkan yang lama', async () => {
    const res = await call(publishHandler, { body: { versionId: 'version-2' } })

    expect(res.statusCode).toBe(200)
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
    expect(prismaMock.agentVersion.updateMany).toHaveBeenCalledWith({
      where: { agentId: 'agent-1', status: 'PUBLISHED' },
      data: { status: 'ARCHIVED' },
    })
    expect(prismaMock.agentVersion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'version-2' },
        data: expect.objectContaining({ status: 'PUBLISHED' }),
      })
    )
    expect(prismaMock.agent.update).toHaveBeenCalledWith({
      where: { id: 'agent-1' },
      data: { productionVersionId: 'version-2' },
    })
  })

  it('TC-64b menolak versi milik agent lain', async () => {
    prismaMock.agentVersion.findFirst = vi.fn().mockResolvedValue(null)

    const res = await call(publishHandler, { body: { versionId: 'version-asing' } })

    expect(res.statusCode).toBe(404)
    expect(res.body.error?.code).toBe('VERSION_NOT_FOUND')
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('TC-64c menolak permintaan tanpa versi', async () => {
    const res = await call(publishHandler, { body: {} })

    expect(res.statusCode).toBe(422)
    expect(Object.keys(res.body.error?.details ?? {})).toContain('versionId')
  })
})
