import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { DataFormsDetailField } from '@/features/forms/types/formsTypes'
import ResponsesField from '@/features/responses/components/responsesField'

const getField = (
  overrides: Partial<DataFormsDetailField> = {}
): DataFormsDetailField => ({
  id: 'field-1',
  label: 'Pilih Sesi',
  description: '',
  placeholder: '',
  type: 'RADIO',
  isRequired: true,
  options: ['Sesi Pagi', 'Sesi Malam'],
  order: 0,
  ...overrides,
})

describe('field bawaan', () => {
  it('TC-02 field pilihan menampilkan seluruh opsinya', () => {
    render(
      <ResponsesField
        index={2}
        field={getField()}
        value=""
        error=""
        onEditAnswer={vi.fn()}
      />
    )

    expect(screen.getByText('Sesi Pagi')).toBeInTheDocument()
    expect(screen.getByText('Sesi Malam')).toBeInTheDocument()
  })

  it('TC-03 pesan kesalahan field wajib ikut tampil', () => {
    render(
      <ResponsesField
        index={2}
        field={getField({ type: 'SHORT_TEXT', label: 'Asal Instansi' })}
        value=""
        error="This field is required."
        onEditAnswer={vi.fn()}
      />
    )

    expect(screen.getByText('This field is required.')).toBeInTheDocument()
  })
})
