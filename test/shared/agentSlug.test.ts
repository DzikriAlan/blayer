import { describe, expect, it } from 'vitest'

import {
  getFreeSlug,
  getSlugCandidates,
  getSlugFromName,
} from '@server/shared/utils/slug.util'

describe('penurunan slug dari nama', () => {
  it('TC-81a mengubah nama biasa menjadi slug yang aman di URL', () => {
    expect(getSlugFromName('Accounting Assistant')).toBe('accounting-assistant')
    expect(getSlugFromName('PT. Easy Accounting!')).toBe('pt-easy-accounting')
    expect(getSlugFromName('  Support   Triage  ')).toBe('support-triage')
  })

  it('TC-81b tidak menyisakan tanda hubung menggantung', () => {
    expect(getSlugFromName('Invoice Reader --')).toBe('invoice-reader')
  })

  it('TC-81c memberi slug cadangan saat namanya tidak menyisakan huruf', () => {
    const slug = getSlugFromName('🙂🙂')

    expect(slug.length).toBeGreaterThanOrEqual(3)
    expect(slug.startsWith('agent-')).toBe(true)
  })

  it('TC-81d memotong nama yang kepanjangan', () => {
    expect(getSlugFromName('a'.repeat(80)).length).toBeLessThanOrEqual(48)
  })
})

describe('pemilihan slug yang bebas', () => {
  it('TC-82a memakai slug pertama yang belum terpakai', async () => {
    const taken = new Set(['accounting-assistant', 'accounting-assistant-2'])

    const slug = await getFreeSlug(
      getSlugCandidates('Accounting Assistant'),
      async (candidate) => taken.has(candidate)
    )

    expect(slug).toBe('accounting-assistant-3')
  })

  it('TC-82b menghormati slug yang diketik sendiri tanpa menambah akhiran', async () => {
    const candidates = getSlugCandidates('Accounting Assistant', 'akuntansi')

    expect(candidates[0]).toBe('akuntansi')
    expect(await getFreeSlug(['akuntansi'], async () => false)).toBe('akuntansi')
  })

  it('TC-82c mengembalikan null saat semua calonnya sudah dipakai', async () => {
    const slug = await getFreeSlug(getSlugCandidates('Accounting Assistant'), async () => true)

    expect(slug).toBeNull()
  })
})
