import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import HomeList from '@/features/home/components/homeList'
import type { DataSearch } from '@/features/search/types/searchTypes'
import { getSearchList } from '@/features/search/services/searchServices'

vi.mock('@/features/search/services/searchServices', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/search/services/searchServices')>()),
  getSearchList: vi.fn(),
}))

const getVideo = (id: string, title: string, category: string): DataSearch => ({
  id,
  category,
  url: `https://www.youtube.com/watch?v=${id}`,
  isShort: false,
  title,
  channel: 'Kanal Uji',
  channelId: 'UC123',
  channelUrl: '',
  verifiedChannel: false,
  duration: '10.05',
  views: 1200,
  isLive: false,
  thumbnail: `https://i.ytimg.com/vi/${id}/hq720.jpg`,
  publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
  scrapedAt: new Date().toISOString(),
})

const CATEGORIES = ['Politik', 'Ekonomi', 'Kriminal']

const renderHome = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <HomeList />
    </QueryClientProvider>,
  )

describe('beranda', () => {
  beforeEach(() => {
    vi.mocked(getSearchList).mockReset()
    vi.mocked(getSearchList).mockResolvedValue(
      CATEGORIES.flatMap((category) => [
        getVideo(`${category.slice(0, 5)}-1`.padEnd(11, 'x'), `${category} pertama`, category),
        getVideo(`${category.slice(0, 5)}-2`.padEnd(11, 'y'), `${category} kedua`, category),
      ]),
    )
  })

  it('menampilkan judul, kategori, dan video dari semua kategori', async () => {
    renderHome()

    expect(screen.getByRole('heading', { name: 'Indonesia Hari Ini', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Politik' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ekonomi' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kriminal' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Saham' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Crypto' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hukum & Kriminal' })).not.toBeInTheDocument()

    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(6))
    expect(screen.getAllByText('1,2 rb ditonton · 1 hari lalu')).toHaveLength(6)
    expect(screen.getByText('6 video · 3 hari terakhir')).toBeInTheDocument()
    expect(screen.getAllByText('10:05').length).toBeGreaterThan(0)
  })

  it('menyaring video saat kategori dipilih tanpa memanggil API lagi', async () => {
    renderHome()
    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(6))

    await userEvent.click(screen.getByRole('button', { name: 'Kriminal' }))

    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(2))
    expect(screen.getByText('Kriminal pertama')).toBeInTheDocument()
    expect(getSearchList).toHaveBeenCalledTimes(1)
  })

  it('menampilkan 20 video dulu lalu 20 berikutnya saat digulir', async () => {
    let onIntersect: IntersectionObserverCallback = () => undefined
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          onIntersect = callback
        }
        observe() {}
        disconnect() {}
      },
    )
    vi.mocked(getSearchList).mockResolvedValue(
      Array.from({ length: 30 }, (_, index) => getVideo(`krim-${index}`.padEnd(11, 'z'), `Kriminal ${index}`, 'Kriminal')),
    )
    renderHome()

    await userEvent.click(screen.getByRole('button', { name: 'Kriminal' }))
    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(20))

    act(() => onIntersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver))
    expect(await screen.findByText('Memuat 10 video berikutnya…')).toBeInTheDocument()
    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(30), { timeout: 2000 })
    vi.unstubAllGlobals()
  })

  it('menampilkan pesan dan tombol coba lagi saat API gagal', async () => {
    vi.mocked(getSearchList).mockRejectedValue(new Error('Server video tidak bisa dihubungi.'))
    renderHome()

    expect(await screen.findByRole('alert')).toHaveTextContent('Server video tidak bisa dihubungi.')
    expect(screen.getByRole('button', { name: /Coba lagi/ })).toBeInTheDocument()
  })
})
