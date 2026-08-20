/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// vi.mock diangkat ke atas berkas oleh vitest, jadi impor biasa sudah melihat
// versi tiruannya; `await import` di sini akan menjadi top-level await yang
// ditolak tsconfig proyek.
import { postAuthForgotPassword } from '@/features/auth/services/authServices'

const resetPasswordForEmail = vi.fn()

vi.mock('@/shared/lib/supabaseBrowser', () => ({
  getSupabaseBrowser: () => ({
    auth: { resetPasswordForEmail },
  }),
  isSupabaseAuthReady: true,
  getSupabaseAuthSetupMessage: () => '',
}))

beforeEach(() => {
  resetPasswordForEmail.mockReset().mockResolvedValue({ error: null })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { origin: 'https://blayer.test' } },
  })
})

describe('pemulihan kata sandi', () => {
  it('TC-48a alamat sintetis ditolak, bukan dijanjikan surat yang tak akan datang', async () => {
    // Supabase menjawab sukses untuk alamat apa pun demi mencegah enumerasi
    // akun, jadi tanpa penjagaan ini pengguna menunggu surat selamanya.
    await expect(
      postAuthForgotPassword('adminblayer@blayer.id')
    ).rejects.toThrow(/tidak bisa menerima surat/i)

    expect(resetPasswordForEmail).not.toHaveBeenCalled()
  })

  it('TC-48a alamat sungguhan tetap diteruskan ke Supabase', async () => {
    await postAuthForgotPassword('  Orang@Gmail.com  ')

    expect(resetPasswordForEmail).toHaveBeenCalledWith(
      'orang@gmail.com',
      expect.objectContaining({
        redirectTo: 'https://blayer.test/auth/reset-password',
      })
    )
  })
})
