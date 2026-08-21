/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'

import {
  createRecoveryToken,
  getRecoveryEmailProblem,
  getTokenHash,
  isTokenAlive,
  isTokenMatching,
} from '@/shared/lib/recoveryEmail'

describe('token alamat pemulihan', () => {
  it('TC-52a yang disimpan hash, bukan tokennya sendiri', () => {
    const { token, hash } = createRecoveryToken()

    // Isi user_metadata terbaca oleh sesi pemiliknya. Token mentah di sana
    // berarti siapa pun yang sempat membacanya bisa memakai ulang tautannya.
    expect(hash).not.toBe(token)
    expect(hash).toBe(getTokenHash(token))
    expect(token).toHaveLength(64)
  })

  it('TC-52a token yang salah ditolak, yang benar diterima', () => {
    const { token, hash } = createRecoveryToken()

    expect(isTokenMatching(token, hash)).toBe(true)
    expect(isTokenMatching(createRecoveryToken().token, hash)).toBe(false)
    expect(isTokenMatching('', hash)).toBe(false)
    expect(isTokenMatching(token, '')).toBe(false)
    // Panjang berbeda tidak boleh membuat pembandingannya melempar.
    expect(isTokenMatching(token, 'abc')).toBe(false)
  })

  it('TC-52b masa berlaku dihitung, bukan diabaikan', () => {
    const now = 1_000_000

    expect(isTokenAlive(now + 1, now)).toBe(true)
    expect(isTokenAlive(now - 1, now)).toBe(false)
    expect(isTokenAlive(undefined, now)).toBe(false)
    expect(isTokenAlive(null, now)).toBe(false)
  })
})

describe('aturan alamat pemulihan', () => {
  it('TC-52c alamat internal ditolak', () => {
    // Alamat itu dibuat otomatis dari username dan tidak pernah bisa menerima
    // surat; menyimpannya hanya menghasilkan janji yang tak bisa ditepati.
    expect(getRecoveryEmailProblem('adminblayer@blayer.id', 'blayer.id')).toMatch(
      /tidak bisa menerima surat/i
    )
  })

  it('TC-52c alamat sungguhan diterima, yang belum lengkap ditolak', () => {
    expect(getRecoveryEmailProblem('orang@gmail.com', 'blayer.id')).toBe('')
    expect(getRecoveryEmailProblem('  Orang@Gmail.com  ', 'blayer.id')).toBe('')
    expect(getRecoveryEmailProblem('', 'blayer.id')).toMatch(/wajib/i)
    expect(getRecoveryEmailProblem('orang@', 'blayer.id')).toMatch(/belum lengkap/i)
    expect(getRecoveryEmailProblem('orang', 'blayer.id')).toMatch(/belum lengkap/i)
  })
})
