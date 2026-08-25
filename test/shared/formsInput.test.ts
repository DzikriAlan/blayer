import { describe, expect, it } from 'vitest'

import { getFormsInput } from '@/shared/lib/formsInput'

const getBody = (patch: Record<string, unknown> = {}) => ({
  title: 'Pendaftaran Workshop',
  fields: [{ label: 'Nama', type: 'SHORT_TEXT' }],
  ...patch,
})

describe('normalisasi payload form', () => {
  it('TC-42e menolak judul kosong', () => {
    expect(getFormsInput(getBody({ title: '   ' })).error).toBeTruthy()
  })

  it('TC-42f menolak form tanpa field', () => {
    expect(getFormsInput(getBody({ fields: [] })).error).toBeTruthy()
  })

  it('TC-42g menolak jenis field yang tidak dikenal database', () => {
    const result = getFormsInput(
      getBody({ fields: [{ label: 'Nama', type: 'SQL_INJECTION' }] })
    )

    expect(result.error?.message).toContain('SQL_INJECTION')
  })

  it('TC-42h menolak field tanpa label', () => {
    const result = getFormsInput(
      getBody({ fields: [{ label: '  ', type: 'SHORT_TEXT' }] })
    )

    expect(result.error).toBeTruthy()
  })

  it('TC-42i mengabaikan harga negatif', () => {
    expect(getFormsInput(getBody({ price: -5000 })).data?.priceAmount).toBe(null)
  })

  it('TC-42j menyimpan teks kosong sebagai null, bukan string kosong', () => {
    const { data } = getFormsInput(getBody({ description: '   ' }))

    expect(data?.description).toBe(null)
  })

  it('TC-42k memberi urutan field mengikuti urutan kirim', () => {
    const { data } = getFormsInput(
      getBody({
        fields: [
          { label: 'Satu', type: 'SHORT_TEXT' },
          { label: 'Dua', type: 'LONG_TEXT' },
        ],
      })
    )

    expect(data?.fields.map((field) => field.order)).toEqual([0, 1])
  })

  it('TC-42l menolak form dengan field melampaui batas wajar', () => {
    const fields = Array.from({ length: 101 }, (_, index) => ({
      label: `Field ${index}`,
      type: 'SHORT_TEXT',
    }))

    expect(getFormsInput(getBody({ fields })).error).toBeTruthy()
  })
})
