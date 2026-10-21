import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import HomeList from '@/features/home/components/homeList'
import type { DataSearch, PayloadGetSearch } from '@/features/search/types/searchTypes'
import { getSearch } from '@/features/search/services/searchServices'

vi.mock('@/features/search/services/searchServices', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/search/services/searchServices')>()),
  getSearch: vi.fn(),
}))

const getVideo = (id: string, title: string): DataSearch => ({
  id,
  url: `https://www.youtube.com/watch?v=${id}`,
  isShort: false,
  embedUrl: `https://www.youtube.com/embed/${id}`,
  title,
  channel: 'Kanal Uji',
  channelId: 'UC123',
  channelUrl: '',
  verifiedChannel: false,
  published: '1 hari lalu',
  publishedHoursAgo: 48,
  duration: '10.05',
  views: 1200,
  isLive: false,
  snippet: '',
  thumbnail: `https://i.ytimg.com/vi/${id}/hq720.jpg`,
})

const renderHome = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <HomeList />
    </QueryClientProvider>,
  )

describe('beranda', () => {
  beforeEach(() => {
    vi.mocked(getSearch).mockReset()
    vi.mocked(getSearch).mockImplementation(async (payload: PayloadGetSearch) => ({
      data: [getVideo(`${payload.q[0].slice(0, 5)}-1`.padEnd(11, 'x'), `${payload.q[0]} pertama`), getVideo(`${payload.q[0].slice(0, 5)}-2`.padEnd(11, 'y'), `${payload.q[0]} kedua`)],
      pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
    }))
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
    expect(screen.queryByRole('button', { name: 'Investasi' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Psikologi' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pengembangan Diri' })).not.toBeInTheDocument()

    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(6))
    expect(screen.getAllByText('1,2 rb ditonton · 1 hari lalu')).toHaveLength(6)
    expect(screen.getByText('6 video · 48 jam terakhir')).toBeInTheDocument()
    expect(screen.getAllByText('10:05').length).toBeGreaterThan(0)
  })

  it('menyaring video saat kategori dipilih', async () => {
    renderHome()
    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(6))

    await userEvent.click(screen.getByRole('button', { name: 'Kriminal' }))

    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(2))
    expect(screen.getByText('berita kriminal hari ini pertama')).toBeInTheDocument()
  })

  it('meminta 100 video per kategori dengan batas 48 jam', async () => {
    renderHome()
    await waitFor(() => expect(getSearch).toHaveBeenCalledTimes(3))

    for (const [payload] of vi.mocked(getSearch).mock.calls) {
      expect(payload.limit).toBe(100)
      expect(payload.maxAgeHours).toBe(48)
      expect(payload.shortsPercent).toBe(15)
      expect(payload.q.length).toBeGreaterThan(1)
    }
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
    vi.mocked(getSearch).mockImplementation(async (payload: PayloadGetSearch) => ({
      data: payload.q[0] === 'berita kriminal hari ini' ? Array.from({ length: 30 }, (_, index) => getVideo(`ihsg-${index}`.padEnd(11, 'z'), `IHSG ${index}`)) : [],
      pagination: { page: 1, limit: 100, total: 30, totalPages: 1 },
    }))
    renderHome()

    await userEvent.click(screen.getByRole('button', { name: 'Kriminal' }))
    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(20))

    act(() => onIntersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver))
    expect(await screen.findByText('Memuat 10 video berikutnya…')).toBeInTheDocument()
    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(30), { timeout: 2000 })
    vi.unstubAllGlobals()
  })

  it('menampilkan pesan dan tombol coba lagi saat API gagal', async () => {
    vi.mocked(getSearch).mockRejectedValue(new Error('Server video tidak bisa dihubungi.'))
    renderHome()

    expect(await screen.findByRole('alert')).toHaveTextContent('Server video tidak bisa dihubungi.')
    expect(screen.getByRole('button', { name: /Coba lagi/ })).toBeInTheDocument()
  })
})
