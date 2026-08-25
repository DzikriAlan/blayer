import { beforeEach, describe, expect, it, vi } from 'vitest'

import handler from '@/pages/api/health'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { $queryRaw: vi.fn() },
}))

vi.mock('@/shared/lib/prisma', () => ({ prisma: prismaMock }))

const getResponse = () => {
  const res = {
    statusCode: 0,
    body: null as unknown as {
      data: { isReady: boolean; databaseMs: number }
      errors: { code: string }[]
    },
    headersSent: false,
    headers: {} as Record<string, string>,
    setHeader(key: string, value: string) {
      res.headers[key] = value
    },
    getHeader(key: string) {
      return res.headers[key]
    },
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(body: unknown) {
      res.body = body as typeof res.body
      return res
    },
  }
  return res
}

const call = async (method = 'GET') => {
  const res = getResponse()
  await handler({ method, headers: {}, query: {} } as never, res as never)
  return res
}

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  prismaMock.$queryRaw = vi.fn().mockResolvedValue([{ '?column?': 1 }])
})

describe('healthcheck', () => {
  it('TC-48a menjawab siap ketika basis data menjawab', async () => {
    const res = await call()

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toMatchObject({ isReady: true })
    expect(typeof res.body.data.databaseMs).toBe('number')
  })

  it('TC-48b menjawab 503 ketika basis data tidak terjangkau', async () => {
    prismaMock.$queryRaw = vi
      .fn()
      .mockRejectedValue(new Error("Can't reach database server"))

    const res = await call()

    expect(res.statusCode).toBe(503)
    expect(res.body.errors[0].code).toBe('DATABASE_UNAVAILABLE')
  })

  it('TC-48c tidak membocorkan sebab teknis kegagalan ke pemanggil', async () => {
    prismaMock.$queryRaw = vi
      .fn()
      .mockRejectedValue(new Error('password authentication failed for user'))

    const res = await call()

    expect(JSON.stringify(res.body)).not.toContain('password authentication')
  })

  it('TC-48d menolak method selain GET', async () => {
    const res = await call('POST')

    expect(res.statusCode).toBe(405)
  })
})
