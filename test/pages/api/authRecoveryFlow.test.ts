/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// vi.mock diangkat ke atas berkas, jadi variabel biasa belum terbentuk saat
// factory-nya dijalankan. vi.hoisted mengangkat pembuatannya bersama-sama.
const { listUsers, generateLink, sendMail } = vi.hoisted(() => ({
  listUsers: vi.fn(),
  generateLink: vi.fn(),
  sendMail: vi.fn(),
}))

vi.mock('@/shared/lib/supabase', () => ({
  isSupabaseReady: true,
  getSupabaseSetupMessage: () => '',
  supabase: {
    auth: { admin: { listUsers, generateLink } },
  },
}))

vi.mock('@/shared/lib/mailer', () => ({
  isMailerReady: () => true,
  getMailerSetupMessage: () => '',
  sendMail,
}))

import forgotHandler from '@/pages/api/v1/auth/forgot'
import { resetRateLimit } from '@/shared/lib/rateLimit'

const getResponse = () => {
  const res = {
    statusCode: 0,
    body: null as never,
    setHeader: vi.fn(),
    redirect: vi.fn(),
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(body: unknown) {
      res.body = body as never
      return res
    },
  }
  return res
}

const call = async (username: string) => {
  const res = getResponse()
  await forgotHandler(
    {
      method: 'POST',
      headers: { host: 'blayer.test' },
      socket: {},
      query: {},
      body: { username },
    } as never,
    res as never
  )
  return res
}

const getUser = (meta: Record<string, unknown>) => ({
  id: 'user-1',
  email: 'adminblayer@blayer.id',
  user_metadata: meta,
})

beforeEach(async () => {
  await resetRateLimit()
  sendMail.mockReset().mockResolvedValue({ isSent: true, id: 'm1', error: '' })
  generateLink.mockReset().mockResolvedValue({
    data: { properties: { action_link: 'https://supabase.test/recover' } },
    error: null,
  })
  listUsers.mockReset().mockResolvedValue({ data: { users: [] }, error: null })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('permintaan pemulihan kata sandi', () => {
  it('TC-51a jawabannya sama untuk username yang ada maupun tidak', async () => {
    const missing = await call('tidakada')

    listUsers.mockResolvedValue({
      data: {
        users: [
          getUser({ recoveryEmail: 'orang@contoh.test', isRecoveryEmailVerified: true }),
        ],
      },
      error: null,
    })
    const present = await call('adminblayer')

    // Beda sekecil apa pun di sini bisa dipakai memetakan akun mana yang ada.
    expect(missing.statusCode).toBe(present.statusCode)
    expect(missing.body).toEqual(present.body)
  })

  it('TC-51a alamat pemulihan yang belum dikonfirmasi tidak dikirimi apa pun', async () => {
    listUsers.mockResolvedValue({
      data: {
        users: [
          getUser({ recoveryEmail: 'orang@contoh.test', isRecoveryEmailVerified: false }),
        ],
      },
      error: null,
    })

    const res = await call('adminblayer')

    expect(res.statusCode).toBe(200)
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('TC-51b tautan dikirim ke alamat pemulihan, bukan ke alamat login', async () => {
    listUsers.mockResolvedValue({
      data: {
        users: [
          getUser({ recoveryEmail: 'orang@contoh.test', isRecoveryEmailVerified: true }),
        ],
      },
      error: null,
    })

    await call('adminblayer')

    // Alamat login berbentuk @blayer.id dan tidak pernah bisa menerima surat.
    expect(generateLink).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'recovery', email: 'adminblayer@blayer.id' })
    )
    expect(sendMail.mock.calls[0][0].to).toBe('orang@contoh.test')
    expect(sendMail.mock.calls[0][0].html).toContain('https://supabase.test/recover')
  })

  it('TC-51b gagal kirim tetap dijawab sama, tidak dibocorkan ke pemanggil', async () => {
    listUsers.mockResolvedValue({
      data: {
        users: [
          getUser({ recoveryEmail: 'orang@contoh.test', isRecoveryEmailVerified: true }),
        ],
      },
      error: null,
    })
    sendMail.mockResolvedValue({ isSent: false, id: '', error: 'kuota habis' })

    const res = await call('adminblayer')

    expect(res.statusCode).toBe(200)
    expect(JSON.stringify(res.body)).not.toContain('kuota habis')
  })

  it('TC-51c username yang bentuknya keliru tetap ditolak', async () => {
    // Ini tidak membocorkan apa pun tentang akun yang ada.
    const res = await call('ab')

    expect(res.statusCode).toBe(400)
    expect(sendMail).not.toHaveBeenCalled()
  })
})
