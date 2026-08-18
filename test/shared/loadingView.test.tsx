import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import LoadingView from '@/components/loading-view'
import StatusView from '@/components/status-view'

describe('tampilan memuat', () => {
  it('TC-30 menyebut apa yang sedang dimuat, bukan balok kosong', () => {
    render(
      <LoadingView
        title="Menyiapkan Form"
        subtitle="Mengambil pertanyaan dan pengaturan form ini."
      />
    )

    expect(screen.getByText('MEMUAT')).toBeInTheDocument()
    expect(screen.getByText('Menyiapkan Form')).toBeInTheDocument()
    expect(
      screen.getByText('Mengambil pertanyaan dan pengaturan form ini.')
    ).toBeInTheDocument()
  })

  it('TC-30 keadaan memuat diumumkan ke pembaca layar', () => {
    render(<LoadingView title="Memuat Hasil" subtitle="Sebentar." />)

    const status = screen.getByRole('status')

    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('TC-30 jumlah balok pratinjau bisa disesuaikan halaman pemanggil', () => {
    const { container, rerender } = render(
      <LoadingView title="Memuat" subtitle="Sebentar." lines={3} />
    )

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3)

    rerender(<LoadingView title="Memuat" subtitle="Sebentar." lines={0} />)

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(0)
  })
})

describe('tampilan status', () => {
  it('TC-03 pesan kosong maupun galat memuat judul, alasan, dan aksinya', () => {
    render(
      <StatusView
        title="Form Not Found"
        subtitle="Form yang kamu cari tidak tersedia."
        image="/no-data.svg"
      >
        <button type="button">Coba Lagi</button>
      </StatusView>
    )

    expect(screen.getByText('Form Not Found')).toBeInTheDocument()
    expect(
      screen.getByText('Form yang kamu cari tidak tersedia.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Coba Lagi' })).toBeInTheDocument()
  })
})
