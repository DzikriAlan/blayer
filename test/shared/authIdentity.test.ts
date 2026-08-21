import { describe, expect, it } from 'vitest'

import {
  getEmailFromUsername,
  getLoginEmail,
  getLoginProblem,
  getNormalizedUsername,
  getPasswordProblem,
  getUsernameFromEmail,
  getUsernameProblem,
} from '@/shared/lib/authIdentity'

describe('identitas username', () => {
  it('TC-26i username jadi alamat internal yang sama setiap saat', () => {
    expect(getEmailFromUsername('blayeradmin')).toBe('blayeradmin@blayer.id')
    expect(getEmailFromUsername('  BlayerAdmin  ')).toBe(
      'blayeradmin@blayer.id'
    )
    expect(getNormalizedUsername(' ADMIN ')).toBe('admin')
  })

  it('TC-26i alamat internal dikembalikan jadi username saat ditampilkan', () => {
    expect(getUsernameFromEmail('blayeradmin@blayer.id')).toBe('blayeradmin')
    expect(getUsernameFromEmail('orang@gmail.com')).toBe('orang@gmail.com')
  })

  it('TC-26j username yang tidak masuk akal ditolak dengan alasannya', () => {
    expect(getUsernameProblem('')).toMatch(/wajib/i)
    expect(getUsernameProblem('ab')).toMatch(/minimal 3/i)
    expect(getUsernameProblem('a'.repeat(31))).toMatch(/maksimal 30/i)
    expect(getUsernameProblem('ada spasi')).toMatch(/huruf, angka/i)
    expect(getUsernameProblem('blayer.admin_01-x')).toBe('')
  })

  it('TC-26k isian berupa email dijelaskan sebagai email, bukan karakter', () => {
    const internal = getUsernameProblem('adminblayer@blayer.id')
    expect(internal).toMatch(/tanpa @blayer\.id/i)
    expect(internal).toContain('"adminblayer"')
    expect(internal).not.toMatch(/huruf, angka/i)

    const outside = getUsernameProblem('orang@gmail.com')
    expect(outside).toMatch(/bukan alamat email/i)
    expect(outside).toContain('"orang"')

    expect(getUsernameProblem(`${'a'.repeat(28)}@blayer.id`)).toMatch(
      /tanpa @blayer\.id/i
    )
  })

  it('TC-26o isian login dikirim apa adanya bila sudah berupa alamat', () => {
    expect(getLoginEmail('adminblayer')).toBe('adminblayer@blayer.id')
    expect(getLoginEmail('adminblayer@blayer.id')).toBe('adminblayer@blayer.id')
    expect(getLoginEmail('orang@gmail.com')).toBe('orang@gmail.com')
    expect(getLoginEmail('  AdminBlayer@Blayer.id  ')).toBe(
      'adminblayer@blayer.id'
    )
  })

  it('TC-26o kolom login menerima username maupun alamat email', () => {
    expect(getLoginProblem('adminblayer')).toBe('')
    expect(getLoginProblem('adminblayer@blayer.id')).toBe('')
    expect(getLoginProblem('orang@gmail.com')).toBe('')

    expect(getLoginProblem('')).toMatch(/wajib/i)
    expect(getLoginProblem('adminblayer@')).toMatch(/belum lengkap/i)
    expect(getLoginProblem('adminblayer@blayer')).toMatch(/belum lengkap/i)
    expect(getLoginProblem('ab')).toMatch(/minimal 3/i)
    expect(getLoginProblem('ada spasi')).toMatch(/huruf, angka/i)
  })

  it('TC-26j kata sandi pendek ditolak', () => {
    expect(getPasswordProblem('')).toMatch(/wajib/i)
    expect(getPasswordProblem('pendek')).toMatch(/minimal 8/i)
    expect(getPasswordProblem('cukuppanjang')).toBe('')
  })
})
