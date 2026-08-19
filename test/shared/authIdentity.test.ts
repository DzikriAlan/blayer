import { describe, expect, it } from 'vitest'

import {
  getEmailFromUsername,
  getNormalizedUsername,
  getPasswordProblem,
  getUsernameFromEmail,
  getUsernameProblem,
} from '@/shared/lib/authIdentity'

describe('identitas username', () => {
  it('TC-26i username jadi alamat internal yang sama setiap saat', () => {
    // Huruf besar dan spasi tersisa adalah penyebab paling umum "akun tidak
    // ditemukan" padahal pengguna merasa mengetik hal yang sama.
    expect(getEmailFromUsername('blayeradmin')).toBe('blayeradmin@blayer.id')
    expect(getEmailFromUsername('  BlayerAdmin  ')).toBe(
      'blayeradmin@blayer.id'
    )
    expect(getNormalizedUsername(' ADMIN ')).toBe('admin')
  })

  it('TC-26i alamat internal dikembalikan jadi username saat ditampilkan', () => {
    expect(getUsernameFromEmail('blayeradmin@blayer.id')).toBe('blayeradmin')
    // Akun Google memakai email sungguhan, jadi tidak boleh ikut dipotong.
    expect(getUsernameFromEmail('orang@gmail.com')).toBe('orang@gmail.com')
  })

  it('TC-26j username yang tidak masuk akal ditolak dengan alasannya', () => {
    expect(getUsernameProblem('')).toMatch(/wajib/i)
    expect(getUsernameProblem('ab')).toMatch(/minimal 3/i)
    expect(getUsernameProblem('a'.repeat(31))).toMatch(/maksimal 30/i)
    expect(getUsernameProblem('ada spasi')).toMatch(/huruf, angka/i)
    expect(getUsernameProblem('pakai@at')).toMatch(/huruf, angka/i)
    expect(getUsernameProblem('blayer.admin_01-x')).toBe('')
  })

  it('TC-26j kata sandi pendek ditolak', () => {
    expect(getPasswordProblem('')).toMatch(/wajib/i)
    expect(getPasswordProblem('pendek')).toMatch(/minimal 8/i)
    expect(getPasswordProblem('cukuppanjang')).toBe('')
  })
})
