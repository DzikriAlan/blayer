import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
  SESSION_TTL_MS,
  createAdminSession,
  getAdminCredentials,
  isAdminToken,
  isValidAdminSession,
  verifyAdminCredentials,
} from '@/shared/lib/adminSession'

beforeEach(() => {
  delete process.env.BLAYER_ADMIN_USERNAME
  delete process.env.BLAYER_ADMIN_PASSWORD
  delete process.env.BLAYER_SESSION_SECRET
  delete process.env.BLAYER_ADMIN_TOKEN
})

afterEach(() => {
  vi.useRealTimers()
})

describe('kredensial operator', () => {
  it('TC-69a memakai admin/admin123 selama belum disetel', () => {
    const credentials = getAdminCredentials()

    expect(credentials).toMatchObject({
      username: DEFAULT_ADMIN_USERNAME,
      password: DEFAULT_ADMIN_PASSWORD,
      isDefault: true,
    })
    expect(verifyAdminCredentials('admin', 'admin123')).toBe(true)
  })

  it('TC-69b mengikuti env begitu disetel dan berhenti menerima bawaannya', () => {
    process.env.BLAYER_ADMIN_USERNAME = 'operator'
    process.env.BLAYER_ADMIN_PASSWORD = 'kata-sandi-panjang'

    expect(getAdminCredentials().isDefault).toBe(false)
    expect(verifyAdminCredentials('operator', 'kata-sandi-panjang')).toBe(true)
    expect(verifyAdminCredentials('admin', 'admin123')).toBe(false)
  })

  it('TC-69c menolak username benar dengan kata sandi salah, dan sebaliknya', () => {
    expect(verifyAdminCredentials('admin', 'salah')).toBe(false)
    expect(verifyAdminCredentials('bukan-admin', 'admin123')).toBe(false)
    expect(verifyAdminCredentials('', '')).toBe(false)
  })
})

describe('sesi pengelolaan', () => {
  it('TC-70a menerbitkan token yang bisa diperiksa tanpa menyimpan apa pun', () => {
    const session = createAdminSession('admin')

    expect(session.token.startsWith('blas_')).toBe(true)
    expect(isValidAdminSession(session.token)).toBe(true)
    expect(isAdminToken(session.token)).toBe(true)
    expect(Date.parse(session.expiresAt)).toBeGreaterThan(Date.now())
  })

  it('TC-70b menolak token yang tanda tangannya diubah', () => {
    const session = createAdminSession('admin')
    const [payload, signature] = session.token.slice(5).split('.')

    expect(isValidAdminSession(`blas_${payload}.${signature.slice(0, -2)}ff`)).toBe(false)
    expect(isValidAdminSession(`blas_${payload}.pendek`)).toBe(false)
    expect(isValidAdminSession('blas_bukan-token')).toBe(false)
  })

  it('TC-70c menolak isi token yang diganti tanpa menandatanganinya ulang', () => {
    const session = createAdminSession('admin')
    const signature = session.token.split('.')[1]
    const payload = Buffer.from(
      JSON.stringify({ u: 'admin', exp: Date.now() + SESSION_TTL_MS * 10 })
    ).toString('base64url')

    expect(isValidAdminSession(`blas_${payload}.${signature}`)).toBe(false)
  })

  it('TC-70d berhenti berlaku setelah masa sesinya lewat', () => {
    const session = createAdminSession('admin')

    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.now() + SESSION_TTL_MS + 1_000))

    expect(isValidAdminSession(session.token)).toBe(false)
  })

  it('TC-70e batal berlaku begitu kunci penanda tangannya berganti', () => {
    process.env.BLAYER_SESSION_SECRET = 'rahasia-lama'
    const session = createAdminSession('admin')

    process.env.BLAYER_SESSION_SECRET = 'rahasia-baru'

    expect(isValidAdminSession(session.token)).toBe(false)
  })
})

describe('token mentah untuk skrip', () => {
  it('TC-71a tetap diterima saat BLAYER_ADMIN_TOKEN disetel', () => {
    process.env.BLAYER_ADMIN_TOKEN = 'token-mentah-uji'

    expect(isAdminToken('token-mentah-uji')).toBe(true)
    expect(isAdminToken('token-lain')).toBe(false)
  })

  it('TC-71b tidak menerima apa pun saat token mentahnya tidak disetel', () => {
    expect(isAdminToken('token-mentah-uji')).toBe(false)
    expect(isAdminToken('')).toBe(false)
  })
})
