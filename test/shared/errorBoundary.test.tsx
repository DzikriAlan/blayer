import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ErrorBoundary from '@/shared/components/error-boundary'

const Broken = () => {
  throw new Error('komponen gagal')
}

describe('batas error di browser', () => {
  it('TC-42m mengganti layar putih dengan pesan dan jalan keluar', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>
    )

    expect(screen.getByText(/berhenti/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /muat ulang/i })
    ).toBeInTheDocument()
    errorSpy.mockRestore()
  })

  it('TC-42n tidak mengganggu halaman yang normal', () => {
    render(
      <ErrorBoundary>
        <p>Isi halaman</p>
      </ErrorBoundary>
    )

    expect(screen.getByText('Isi halaman')).toBeInTheDocument()
  })
})
