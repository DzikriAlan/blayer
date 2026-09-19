import { beforeEach, describe, expect, it, vi } from 'vitest'

import loginHandler from '@/pages/api/v1/auth/login'
import agentsHandler from '@/pages/api/v1/agents'
import { resetRateLimit } from '@server/shared/services/rateLimit.service'
import { getTestRequest, getTestResponse, muteLogger } from '../../helpers/apiTest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { agent: { findMany: vi.fn() } },
}))

vi.mock('@server/shared/prisma.service', () => ({ prismaService: prismaMock }))

const login = async (body: unknown, method = 'POST') => {
  const res = getTestResponse()

  await loginHandler(
    getTestRequest({ method, body }) as never,
    res as never
  )

  return res
}

beforeEach(async () => {
  muteLogger()
  await resetRateLimit()

  delete process.env.BLAYER_ADMIN_USERNAME
  delete process.env.BLAYER_ADMIN_PASSWORD
  delete process.env.BLAYER_SESSION_SECRET
  delete process.env.BLAYER_ADMIN_TOKEN

  prismaMock.agent.findMany = vi.fn().mockResolvedValue([])
})

describe('login pengelolaan', () => {
  it('TC-72a menerima admin/admin123 pada instance yang belum disetel', async () => {
    const res = await login({ username: 'admin', password: 'admin123' })
    const data = res.body.data as {
      token: string
      username: string
      isDefaultCredentials: boolean
    }

    expect(res.statusCode).toBe(200)
    expect(data.token.startsWith('blas_')).toBe(true)
    expect(data.username).toBe('admin')
    expect(data.isDefaultCredentials).toBe(true)
  })

  it('TC-72b menolak kata sandi salah tanpa menyebut bagian mana yang keliru', async () => {
    const res = await login({ username: 'admin', password: 'salah' })

    expect(res.statusCode).toBe(401)
    expect(res.body.error?.code).toBe('INVALID_CREDENTIALS')
    expect(res.body.error?.message).toBe('Username atau kata sandi salah.')
  })

  it('TC-72c menolak username salah dengan pesan yang sama persis', async () => {
    const res = await login({ username: 'bukan-admin', password: 'admin123' })

    expect(res.body.error?.message).toBe('Username atau kata sandi salah.')
  })

  it('TC-72d berhenti menerima bawaan begitu kredensialnya disetel', async () => {
    process.env.BLAYER_ADMIN_USERNAME = 'operator'
    process.env.BLAYER_ADMIN_PASSWORD = 'kata-sandi-panjang'

    expect((await login({ username: 'admin', password: 'admin123' })).statusCode).toBe(401)

    const res = await login({ username: 'operator', password: 'kata-sandi-panjang' })

    expect(res.statusCode).toBe(200)
    expect((res.body.data as { isDefaultCredentials: boolean }).isDefaultCredentials).toBe(false)
  })

  it('TC-72e menolak badan permintaan yang tidak lengkap', async () => {
    const res = await login({ username: 'admin' })

    expect(res.statusCode).toBe(422)
    expect(Object.keys(res.body.error?.details ?? {})).toContain('password')
  })

  it('TC-72f membatasi tebakan beruntun dari satu sumber', async () => {
    const attempts = []

    for (let attempt = 0; attempt < 11; attempt += 1) {
      attempts.push(await login({ username: 'admin', password: 'salah' }))
    }

    expect(attempts[10].statusCode).toBe(429)
    expect(attempts[10].body.error?.code).toBe('RATE_LIMITED')
  })

  it('TC-72g menolak method selain POST', async () => {
    const res = await login({}, 'GET')

    expect(res.statusCode).toBe(405)
  })
})

describe('sesi hasil login', () => {
  it('TC-73a membuka rute pengelolaan tanpa token mentah apa pun', async () => {
    const session = await login({ username: 'admin', password: 'admin123' })
    const { token } = session.body.data as { token: string }

    const res = getTestResponse()
    await agentsHandler(
      getTestRequest({
        method: 'GET',
        headers: { authorization: `Bearer ${token}` },
      }) as never,
      res as never
    )

    expect(res.statusCode).toBe(200)
  })

  it('TC-73b menolak rute pengelolaan tanpa sesi', async () => {
    const res = getTestResponse()
    await agentsHandler(
      getTestRequest({ method: 'GET' }) as never,
      res as never
    )

    expect(res.statusCode).toBe(401)
    expect(res.body.error?.code).toBe('UNAUTHORIZED')
    expect(prismaMock.agent.findMany).not.toHaveBeenCalled()
  })

  it('TC-73c menolak sesi yang tanda tangannya tidak cocok', async () => {
    const session = await login({ username: 'admin', password: 'admin123' })
    const { token } = session.body.data as { token: string }

    const res = getTestResponse()
    await agentsHandler(
      getTestRequest({
        method: 'GET',
        headers: { authorization: `Bearer ${token.slice(0, -2)}ff` },
      }) as never,
      res as never
    )

    expect(res.statusCode).toBe(401)
  })
})
