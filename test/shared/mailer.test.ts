/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const send = vi.fn()

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))

import { isMailerReady, sendMail } from '@/shared/lib/mailer'

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: 'mail-1' }, error: null })
  process.env.RESEND_API_KEY = 're_kunci_uji'
  delete process.env.MAIL_FROM
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  delete process.env.RESEND_API_KEY
  delete process.env.MAIL_FROM
  vi.restoreAllMocks()
})

describe('pengiriman surat', () => {
  it('TC-49a tanpa kunci, kirim gagal dengan tenang dan tidak menyentuh jaringan', async () => {
    delete process.env.RESEND_API_KEY

    expect(isMailerReady()).toBe(false)

    const result = await sendMail({ to: 'a@b.id', subject: 'Uji', html: '<p>x</p>' })

    expect(result.isSent).toBe(false)
    expect(result.error).toMatch(/RESEND_API_KEY/)
    expect(send).not.toHaveBeenCalled()
  })

  it('TC-49a memakai MAIL_FROM kalau ada, alamat percobaan kalau belum', async () => {
    await sendMail({ to: 'a@b.id', subject: 'Uji', html: '<p>x</p>' })
    expect(send.mock.calls[0][0].from).toBe('onboarding@resend.dev')
  })

  it('TC-49b kegagalan dikembalikan, bukan dilempar', async () => {
    // Pemanggilnya yang memutuskan apakah gagal kirim layak menjatuhkan
    // seluruh permintaan. Untuk pemulihan kata sandi jawabannya tidak.
    send.mockResolvedValue({ data: null, error: { message: 'kuota habis' } })

    const result = await sendMail({ to: 'a@b.id', subject: 'Uji', html: '<p>x</p>' })

    expect(result.isSent).toBe(false)
    expect(result.error).toBe('kuota habis')
  })

  it('TC-49b alamat tujuan tidak ikut tercatat saat gagal', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'ditolak' } })

    await sendMail({ to: 'orang@contoh.test', subject: 'Uji', html: '<p>x</p>' })

    const logged = (console.error as unknown as ReturnType<typeof vi.fn>).mock
      .calls.flat()
      .join(' ')
    expect(logged).not.toContain('orang@contoh.test')
  })
})
