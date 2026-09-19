import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentEnvironment, AgentProvider } from '@prisma/client'

import { projectsModule } from '@server/features/projects/module'
import { decryptSecret, hashToken } from '@server/shared/utils/crypto.util'
import { getTestRequest, getTestResponse, muteLogger } from '../../helpers/apiTest'

const keysHandler = projectsModule.keys
const credentialsHandler = projectsModule.credentials

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    project: { findUnique: vi.fn() },
    projectApiKey: { findMany: vi.fn(), create: vi.fn() },
    providerCredential: { findMany: vi.fn(), upsert: vi.fn() },
  },
}))

vi.mock('@server/shared/prisma.service', () => ({ prismaService: prismaMock }))

const ADMIN_TOKEN = 'token-pengelolaan-uji'

const call = async (
  handler: typeof keysHandler,
  {
    token = ADMIN_TOKEN,
    method = 'POST',
    body,
    projectId = 'project-1',
  }: { token?: string; method?: string; body?: unknown; projectId?: string } = {}
) => {
  const res = getTestResponse()

  await handler(
    getTestRequest({
      method,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      query: { projectId },
      body,
    }) as never,
    res as never
  )

  return res
}

beforeEach(() => {
  muteLogger()
  process.env.BLAYER_ADMIN_TOKEN = ADMIN_TOKEN
  process.env.BLAYER_ENCRYPTION_KEY = Buffer.alloc(32, 5).toString('base64')

  prismaMock.project.findUnique = vi.fn().mockResolvedValue({ id: 'project-1' })
  prismaMock.projectApiKey.findMany = vi.fn().mockResolvedValue([])
  prismaMock.projectApiKey.create = vi.fn().mockImplementation(({ data }) =>
    Promise.resolve({
      id: 'key-1',
      name: data.name,
      environment: data.environment,
      prefix: data.prefix,
    })
  )
  prismaMock.providerCredential.findMany = vi.fn().mockResolvedValue([])
  prismaMock.providerCredential.upsert = vi.fn().mockResolvedValue({
    id: 'credential-1',
    provider: AgentProvider.ANTHROPIC,
    environment: AgentEnvironment.PRODUCTION,
    hint: '****4321',
  })
})

describe('API key project', () => {
  it('TC-65a menerbitkan token sekali dan hanya menyimpan hash-nya', async () => {
    const res = await call(keysHandler, {
      body: { name: 'server produksi', environment: AgentEnvironment.PRODUCTION },
    })

    const data = res.body.data as { token: string; prefix: string }
    const stored = prismaMock.projectApiKey.create.mock.calls[0][0].data

    expect(res.statusCode).toBe(201)
    expect(data.token.startsWith('blr_')).toBe(true)
    expect(stored.hash).toBe(hashToken(data.token))
    expect(stored).not.toHaveProperty('token')
    expect(JSON.stringify(stored)).not.toContain(data.token)
  })

  it('TC-65b tidak pernah mengembalikan token lagi saat daftarnya dibaca', async () => {
    prismaMock.projectApiKey.findMany = vi.fn().mockResolvedValue([
      {
        id: 'key-1',
        name: 'server produksi',
        environment: AgentEnvironment.PRODUCTION,
        prefix: 'blr_abcdefg',
        hash: 'hash-yang-tersimpan',
        lastUsedAt: null,
        revokedAt: null,
        createdAt: new Date(),
      },
    ])

    const res = await call(keysHandler, { method: 'GET' })

    expect(JSON.stringify(res.body.data)).not.toContain('hash-yang-tersimpan')
  })

  it('TC-65c menolak project yang tidak ada', async () => {
    prismaMock.project.findUnique = vi.fn().mockResolvedValue(null)

    const res = await call(keysHandler, { body: { name: 'server produksi' } })

    expect(res.statusCode).toBe(404)
    expect(res.body.error?.code).toBe('PROJECT_NOT_FOUND')
  })

  it('TC-65d menolak permintaan tanpa token pengelolaan', async () => {
    const res = await call(keysHandler, { token: '', body: { name: 'server' } })

    expect(res.statusCode).toBe(401)
    expect(prismaMock.projectApiKey.create).not.toHaveBeenCalled()
  })
})

describe('kredensial provider project', () => {
  it('TC-66a menyimpan kunci dalam bentuk terenkripsi beserta petunjuk empat karakter', async () => {
    const res = await call(credentialsHandler, {
      method: 'PUT',
      body: {
        provider: AgentProvider.ANTHROPIC,
        environment: AgentEnvironment.PRODUCTION,
        secret: 'sk-ant-rahasia4321',
      },
    })

    const stored = prismaMock.providerCredential.upsert.mock.calls[0][0]

    expect(res.statusCode).toBe(200)
    expect(stored.create.secret).not.toContain('sk-ant-rahasia4321')
    expect(decryptSecret(stored.create.secret)).toBe('sk-ant-rahasia4321')
    expect(stored.create.hint).toBe('****4321')
  })

  it('TC-66b menolak menyimpan saat kunci enkripsi instance belum disetel', async () => {
    delete process.env.BLAYER_ENCRYPTION_KEY

    const res = await call(credentialsHandler, {
      method: 'PUT',
      body: {
        provider: AgentProvider.ANTHROPIC,
        environment: AgentEnvironment.PRODUCTION,
        secret: 'sk-ant-rahasia4321',
      },
    })

    expect(res.statusCode).toBe(503)
    expect(res.body.error?.code).toBe('CONFIG_MISSING')
    expect(prismaMock.providerCredential.upsert).not.toHaveBeenCalled()
  })

  it('TC-66c tidak membocorkan kunci provider saat daftarnya dibaca', async () => {
    prismaMock.providerCredential.findMany = vi.fn().mockResolvedValue([
      {
        id: 'credential-1',
        provider: AgentProvider.ANTHROPIC,
        environment: AgentEnvironment.PRODUCTION,
        hint: '****4321',
        updatedAt: new Date(),
      },
    ])

    const res = await call(credentialsHandler, { method: 'GET' })

    expect(res.statusCode).toBe(200)
    expect(JSON.stringify(res.body.data)).not.toContain('secret')
  })

  it('TC-66d menolak method yang tidak dilayani', async () => {
    const res = await call(credentialsHandler, { method: 'DELETE' })

    expect(res.statusCode).toBe(405)
  })
})
