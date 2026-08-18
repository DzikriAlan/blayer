import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LoadData } from '@/shared/components/load-data'

describe('penangan tampilan data', () => {
  it('TC-30 keadaan memuat memberi ikon berputar yang terbaca pembaca layar', () => {
    render(
      <LoadData response={{ isLoading: true }}>
        <p>isi</p>
      </LoadData>
    )

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.queryByText('isi')).not.toBeInTheDocument()
  })

  it('TC-30 keadaan kosong menampilkan judul dan alasannya', () => {
    render(
      <LoadData
        response={{
          isEmpty: true,
          emptyTitle: 'No Forms Yet',
          emptySubtitle: 'Mulai dengan membuat form pertama.',
        }}
      >
        <p>isi</p>
      </LoadData>
    )

    expect(screen.getByText('No Forms Yet')).toBeInTheDocument()
    expect(
      screen.getByText('Mulai dengan membuat form pertama.')
    ).toBeInTheDocument()
    expect(screen.queryByText('isi')).not.toBeInTheDocument()
  })

  it('TC-30 keadaan gagal dibedakan dari keadaan kosong', () => {
    render(
      <LoadData
        response={{
          isError: true,
          errorTitle: 'Something Broke',
          errorSubtitle: 'Coba lagi sebentar.',
        }}
      >
        <p>isi</p>
      </LoadData>
    )

    expect(screen.getByText('Something Broke')).toBeInTheDocument()
    expect(screen.queryByText('isi')).not.toBeInTheDocument()
  })

  it('TC-30 isi dirender begitu datanya siap', () => {
    render(
      <LoadData response={{ isLoading: false, isEmpty: false }}>
        <p>isi</p>
      </LoadData>
    )

    expect(screen.getByText('isi')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
