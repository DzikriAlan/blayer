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
      label="Pilih Sesi"
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
  it('TC-02 menyediakan 13 tipe field', () => {
    const values = FORMS_FIELD_TYPES.map((item) => item.value)

    expect(values).toHaveLength(13)
  })

  it('TC-02 tidak ada tipe yang tercatat dua kali', () => {
    const values = FORMS_FIELD_TYPES.map((item) => item.value)

    expect(new Set(values).size).toBe(values.length)
  })
})

describe('panduan pengisian opsi', () => {
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
