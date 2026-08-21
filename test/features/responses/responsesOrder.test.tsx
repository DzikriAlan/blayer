import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ResponsesOrder, {
  type ResponsesOrderItem,
} from '@/features/responses/components/responsesOrder'

const ITEMS: ResponsesOrderItem[] = [
  { name: 'Nasi Goreng Kampung', qty: 2, price: 28000, subtotal: 56000 },
  { name: 'Es Teh Manis', qty: 1, price: 8000, subtotal: 8000 },
]

const renderOrder = (props: Partial<Parameters<typeof ResponsesOrder>[0]> = {}) =>
  render(
    <ResponsesOrder
      formId="form-1"
      title="Pesan Menu — Warung Blayer"
      image=""
      name="Bagas Wicaksono"
      items={ITEMS}
      amount={64000}
      paymentMethod="QRIS"
      {...props}
    />
  )

describe('struk pesanan', () => {
  it('TC-17 mencantumkan nama pemesan dan judul pesanannya', () => {
    renderOrder()

    expect(screen.getByText('Pesan Menu — Warung Blayer')).toBeInTheDocument()
    expect(screen.getByText('Bagas Wicaksono')).toBeInTheDocument()
  })

  it('TC-17 tiap item tampil dengan jumlah dan subtotalnya', () => {
    renderOrder()

    expect(screen.getByText('Nasi Goreng Kampung')).toBeInTheDocument()
    expect(screen.getByText('02 × Rp28.000')).toBeInTheDocument()
    expect(screen.getByText('Rp56.000')).toBeInTheDocument()
  })

  it('TC-17 total tagihan dan metode pembayaran ikut tercetak', () => {
    renderOrder()

    expect(screen.getByText('TOTAL TAGIHAN')).toBeInTheDocument()
    expect(screen.getByText('Rp64.000')).toBeInTheDocument()
    expect(screen.getByText('QRIS')).toBeInTheDocument()
  })

  it('TC-23 struk menyatakan pembayaran masih menunggu konfirmasi', () => {
    renderOrder()

    expect(screen.getByText(/menunggu konfirmasi/i)).toBeInTheDocument()
  })

  it('TC-17 pesanan tanpa item tetap terbaca, bukan halaman kosong', () => {
    renderOrder({ items: [], amount: 0 })

    expect(screen.getByText('Tidak Ada Item')).toBeInTheDocument()
  })

  it('TC-10 banner hanya dirender kalau pembuat form mengunggahnya', () => {
    const { rerender } = renderOrder()

    expect(
      screen.queryByAltText('Banner Pesan Menu — Warung Blayer')
    ).not.toBeInTheDocument()

    rerender(
      <ResponsesOrder
        formId="form-1"
        title="Pesan Menu — Warung Blayer"
        image="/menu-nasi-goreng.svg"
        name="Bagas Wicaksono"
        items={ITEMS}
        amount={64000}
        paymentMethod="QRIS"
      />
    )

    expect(
      screen.getByAltText('Banner Pesan Menu — Warung Blayer')
    ).toBeInTheDocument()
  })
})
