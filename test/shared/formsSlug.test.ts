import { describe, expect, it } from 'vitest'

import {
  getSlugCandidates,
  getSlugError,
  getSlugged,
} from '@/shared/lib/formsSlug'

describe('tautan pendek form', () => {
  it('TC-49a mengubah judul jadi tautan yang bisa dieja', () => {
    expect(getSlugged('Pendaftaran Workshop 2026')).toBe(
      'pendaftaran-workshop-2026'
    )
  })

  it('TC-49b membuang tanda baca dan spasi berlebih', () => {
    expect(getSlugged('  Ujian —— Sejarah, Kelas XI!!  ')).toBe(
      'ujian-sejarah-kelas-xi'
    )
  })

  it('TC-49c tidak pernah menyisakan tanda hubung di ujung', () => {
    expect(getSlugged('Form ***')).toBe('form')
    expect(getSlugged('[DEMO] Survei')).toBe('survei')
  })

  it('TC-49d menolak tautan yang bentrok dengan rute sistem', () => {
    expect(getSlugError('login')).not.toBe('')
    expect(getSlugError('api')).not.toBe('')
    expect(getSlugError('pendaftaran-workshop')).toBe('')
  })

  it('TC-49e menolak huruf besar, spasi, dan karakter aneh', () => {
    expect(getSlugError('Daftar Gratis')).not.toBe('')
    expect(getSlugError('daftar_gratis')).not.toBe('')
    expect(getSlugError('ab')).not.toBe('')
  })

  it('TC-49f menyiapkan cadangan bila tautan utama sudah dipakai', () => {
    const candidates = getSlugCandidates('Daftar Gratis', 'ckabcdef123456')

    expect(candidates[0]).toBe('daftar-gratis')
    expect(candidates.length).toBeGreaterThan(1)
    expect(new Set(candidates).size).toBe(candidates.length)
    candidates.forEach((candidate) => expect(getSlugError(candidate)).toBe(''))
  })

  it('TC-49g judul tanpa huruf latin tetap menghasilkan tautan sah', () => {
    const candidates = getSlugCandidates('***', 'ckabcdef123456')

    expect(candidates.length).toBeGreaterThan(0)
    expect(getSlugError(candidates[0])).toBe('')
  })
})
