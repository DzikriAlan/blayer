import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import NotFoundPage from '@/pages/404'
import ServerErrorPage from '@/pages/500'

vi.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/tidak-ada', replace: vi.fn() }),
}))

const renderPage = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('halaman tidak ditemukan', () => {
  it('TC-33 menyebut kode dan penjelasan yang bisa ditindaklanjuti', () => {
    renderPage(<NotFoundPage />)

    expect(screen.getByText('ERROR 404')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /tidak ada/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/salah ketik/i)).toBeInTheDocument()
  })

  it('TC-33 menawarkan jalan keluar, bukan jalan buntu', () => {
    renderPage(<NotFoundPage />)

    expect(
      screen.getByRole('link', { name: /Kembali ke Beranda/ })
    ).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /^Beranda/ })).toHaveAttribute(
      'href',
      '/'
    )
  })

  it('TC-33 memakai rangka halaman dengan logo dan toggle tema', () => {
    renderPage(<NotFoundPage />)

    expect(
      screen.getByRole('link', { name: /Blayer, ke beranda/ })
    ).toHaveAttribute('href', '/')
    expect(screen.getByRole('button', { name: /Ganti ke mode (terang|gelap)/ })).toBeInTheDocument()
  })
})

describe('halaman kesalahan server', () => {
  it('TC-33 membedakan dirinya dari halaman tidak ditemukan', () => {
    renderPage(<ServerErrorPage />)

    expect(screen.getByText('ERROR 500')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /di sisi kami/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/muat ulang/i)).toBeInTheDocument()
  })

  it('TC-33 tetap menyediakan jalan kembali ke aplikasi', () => {
    renderPage(<ServerErrorPage />)

    expect(
      screen.getByRole('link', { name: /Kembali ke Beranda/ })
    ).toHaveAttribute('href', '/')
  })
})
