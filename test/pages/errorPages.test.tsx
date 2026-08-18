import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import NotFoundPage from '@/pages/404'
import ServerErrorPage from '@/pages/500'

describe('halaman tidak ditemukan', () => {
  it('TC-33 menyebut kode dan penjelasan yang bisa ditindaklanjuti', () => {
    render(<NotFoundPage />)

    expect(screen.getByText('ERROR 404')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /tidak ada/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/salah ketik/i)).toBeInTheDocument()
  })

  it('TC-33 menawarkan jalan keluar, bukan jalan buntu', () => {
    render(<NotFoundPage />)

    expect(
      screen.getByRole('link', { name: /Kembali ke Beranda/ })
    ).toHaveAttribute('href', '/')
    expect(screen.getAllByRole('link', { name: /Semua Form/ })[0]).toHaveAttribute(
      'href',
      '/forms'
    )
    expect(screen.getByRole('link', { name: /BUAT FORM/ })).toHaveAttribute(
      'href',
      '/forms/create'
    )
  })

  it('TC-33 memakai rangka halaman publik lengkap dengan navigasinya', () => {
    render(<NotFoundPage />)

    expect(screen.getAllByRole('link', { name: /Buat Form/ }).length).toBeGreaterThan(1)
    expect(screen.getByText(/BLAYER® STUDIO/)).toBeInTheDocument()
  })
})

describe('halaman kesalahan server', () => {
  it('TC-33 membedakan dirinya dari halaman tidak ditemukan', () => {
    render(<ServerErrorPage />)

    expect(screen.getByText('ERROR 500')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /di sisi kami/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/muat ulang/i)).toBeInTheDocument()
  })

  it('TC-33 tetap menyediakan jalan kembali ke aplikasi', () => {
    render(<ServerErrorPage />)

    expect(
      screen.getByRole('link', { name: /Kembali ke Beranda/ })
    ).toHaveAttribute('href', '/')
  })
})
