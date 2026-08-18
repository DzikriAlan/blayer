import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import FormsFieldEditor, {
  FORMS_FIELD_TYPES,
} from '@/features/forms/components/formsFieldEditor'
import type { FormsFieldType } from '@/features/forms/types/formsTypes'

const renderEditor = (type: FormsFieldType, isOptionVisible = true) =>
  render(
    <FormsFieldEditor
      index={0}
      total={1}
      label="Pilih Menu"
      description=""
      placeholder=""
      type={type}
      isRequired
      optionText=""
      isOptionVisible={isOptionVisible}
      labelError=""
      optionError=""
      onEditFieldsItem={vi.fn()}
      onLoadFieldsOrder={vi.fn()}
      onClearFieldsItem={vi.fn()}
    />
  )

describe('daftar tipe field', () => {
  it('TC-02 menyediakan 15 tipe field termasuk menu dan pembayaran', () => {
    const values = FORMS_FIELD_TYPES.map((item) => item.value)

    expect(values).toHaveLength(15)
    expect(values).toContain('MENU')
    expect(values).toContain('PAYMENT')
  })

  it('TC-02 tidak ada tipe yang tercatat dua kali', () => {
    const values = FORMS_FIELD_TYPES.map((item) => item.value)

    expect(new Set(values).size).toBe(values.length)
  })
})

describe('panduan pengisian opsi', () => {
  it('TC-14 field menu menjelaskan format Nama|Harga|URL Gambar', () => {
    renderEditor('MENU')

    expect(
      screen.getByText('Item — satu per baris: Nama|Harga|URL Gambar')
    ).toBeInTheDocument()
    expect(screen.getByText(/Harga ditulis angka polos/i)).toBeInTheDocument()
  })

  it('TC-15 field pembayaran menjelaskan asal tagihannya', () => {
    renderEditor('PAYMENT')

    expect(
      screen.getByText('Metode — satu per baris: Metode|Petunjuk')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Tagihan diambil dari field Menu Bergambar/i)
    ).toBeInTheDocument()
  })

  it('TC-02 field pilihan biasa memakai panduan bawaan', () => {
    renderEditor('SELECT')

    expect(screen.getByText('Options — one per line')).toBeInTheDocument()
  })

  it('TC-02 field tanpa opsi tidak menampilkan kolom opsi sama sekali', () => {
    renderEditor('SHORT_TEXT', false)

    expect(screen.queryByText(/satu per baris/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Options — one per line')).not.toBeInTheDocument()
  })
})
