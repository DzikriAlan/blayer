import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { DataFormsDetailField } from '@/features/forms/types/formsTypes'
import ResponsesField from '@/features/responses/components/responsesField'

const getField = (
  overrides: Partial<DataFormsDetailField> = {}
): DataFormsDetailField => ({
  id: 'field-1',
  label: 'Pilih Menu',
  description: '',
  placeholder: '',
  type: 'MENU',
  isRequired: true,
  options: [
    'Nasi Goreng Kampung|28000|/menu-nasi-goreng.svg',
    'Es Teh Manis|8000|/menu-es-teh.svg',
  ],
  order: 0,
  ...overrides,
})

describe('field menu bergambar', () => {
  it('TC-14 menampilkan nama, harga, dan gambar tiap item', () => {
    render(
      <ResponsesField
        index={2}
        field={getField()}
        value={[]}
        error=""
        onEditAnswer={vi.fn()}
      />
    )

    expect(screen.getByText('Nasi Goreng Kampung')).toBeInTheDocument()
    expect(screen.getByText('Rp28.000')).toBeInTheDocument()
    expect(screen.getByAltText('Nasi Goreng Kampung')).toHaveAttribute(
      'src',
      '/menu-nasi-goreng.svg'
    )
  })

  it('TC-14 menambah porsi mengirim jumlah ke pemanggilnya', async () => {
    const onEditAnswer = vi.fn()
    const user = userEvent.setup()

    render(
      <ResponsesField
        index={2}
        field={getField()}
        value={['Nasi Goreng Kampung']}
        error=""
        onEditAnswer={onEditAnswer}
      />
    )

    await user.click(
      screen.getAllByRole('button', { name: 'Tambah Nasi Goreng Kampung' })[0]
    )

    expect(onEditAnswer).toHaveBeenCalledWith('field-1', [
      'Nasi Goreng Kampung x2',
    ])
  })

  it('TC-14 mengurangi porsi terakhir mengeluarkan item dari pesanan', async () => {
    const onEditAnswer = vi.fn()
    const user = userEvent.setup()

    render(
      <ResponsesField
        index={2}
        field={getField()}
        value={['Nasi Goreng Kampung']}
        error=""
        onEditAnswer={onEditAnswer}
      />
    )

    await user.click(
      screen.getByRole('button', { name: 'Kurangi Nasi Goreng Kampung' })
    )

    expect(onEditAnswer).toHaveBeenCalledWith('field-1', [])
  })

  it('TC-14 subtotal dihitung dari harga dikali jumlah porsi', () => {
    render(
      <ResponsesField
        index={2}
        field={getField()}
        value={['Nasi Goreng Kampung x2', 'Es Teh Manis']}
        error=""
        onEditAnswer={vi.fn()}
      />
    )

    expect(screen.getByText('Rp64.000')).toBeInTheDocument()
  })
})

describe('field metode pembayaran', () => {
  const paymentField = getField({
    id: 'field-payment',
    label: 'Metode Pembayaran',
    type: 'PAYMENT',
    options: [
      'QRIS|Pindai kode di layar',
      'Tunai|Bayar langsung di kasir',
    ],
  })

  it('TC-15 menampilkan total tagihan yang diterima dari form', () => {
    render(
      <ResponsesField
        index={7}
        field={paymentField}
        value=""
        error=""
        amount={64000}
        onEditAnswer={vi.fn()}
      />
    )

    expect(screen.getByText('TOTAL TAGIHAN')).toBeInTheDocument()
    expect(screen.getByText('Rp64.000')).toBeInTheDocument()
  })

  it('TC-15 memilih metode mengirim namanya ke pemanggil', async () => {
    const onEditAnswer = vi.fn()
    const user = userEvent.setup()

    render(
      <ResponsesField
        index={7}
        field={paymentField}
        value=""
        error=""
        amount={64000}
        onEditAnswer={onEditAnswer}
      />
    )

    await user.click(screen.getByRole('button', { name: /Tunai/ }))

    expect(onEditAnswer).toHaveBeenCalledWith('field-payment', 'Tunai')
  })

  it('TC-16 kode QRIS tampil setelah metode QRIS dipilih', () => {
    render(
      <ResponsesField
        index={7}
        field={paymentField}
        value="QRIS"
        error=""
        amount={64000}
        qrisImage="/qris-demo.svg"
        onEditAnswer={vi.fn()}
      />
    )

    expect(screen.getByAltText('Kode QRIS pembayaran')).toHaveAttribute(
      'src',
      '/qris-demo.svg'
    )
  })

  it('TC-16 tanpa unggahan QRIS, pengisi diberi tahu harus bagaimana', () => {
    render(
      <ResponsesField
        index={7}
        field={paymentField}
        value="QRIS"
        error=""
        amount={64000}
        qrisImage=""
        onEditAnswer={vi.fn()}
      />
    )

    expect(screen.queryByAltText('Kode QRIS pembayaran')).not.toBeInTheDocument()
    expect(
      screen.getByText(/belum mengunggah kode QRIS/i)
    ).toBeInTheDocument()
  })

  it('TC-23 status pembayaran dinyatakan belum terverifikasi otomatis', () => {
    render(
      <ResponsesField
        index={7}
        field={paymentField}
        value="Tunai"
        error=""
        amount={64000}
        onEditAnswer={vi.fn()}
      />
    )

    expect(
      screen.getByText(/belum diverifikasi otomatis/i)
    ).toBeInTheDocument()
  })
})

describe('field bawaan lain', () => {
  it('TC-03 pesan kesalahan field wajib ikut tampil', () => {
    render(
      <ResponsesField
        index={2}
        field={getField({ type: 'SHORT_TEXT', label: 'Nomor Meja' })}
        value=""
        error="This field is required."
        onEditAnswer={vi.fn()}
      />
    )

    expect(screen.getByText('This field is required.')).toBeInTheDocument()
  })
})
