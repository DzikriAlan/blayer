import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import HomeList from '@/features/home/components/homeList'
import type { DataSearch, PayloadGetSearch } from '@/features/search/types/searchTypes'
import { getSearch } from '@/features/search/services/searchServices'

vi.mock('@/features/search/services/searchServices', () => ({ getSearch: vi.fn() }))

const getVideo = (id: string, title: string): DataSearch => ({
  id,
  url: `https://www.youtube.com/watch?v=${id}`,
  embedUrl: `https://www.youtube.com/embed/${id}`,
  title,
  channel: 'Kanal Uji',
  channelId: 'UC123',
  channelUrl: '',
  verifiedChannel: false,
  published: '1 hari lalu',
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
    vi.mocked(getSearch).mockImplementation(async (payload: PayloadGetSearch) => ({
      data: [getVideo(`${payload.q.slice(0, 5)}-1`.padEnd(11, 'x'), `${payload.q} pertama`), getVideo(`${payload.q.slice(0, 5)}-2`.padEnd(11, 'y'), `${payload.q} kedua`)],
      pagination: { page: 1, limit: 12, total: 2, totalPages: 1 },
    }))
  })

  it('menampilkan judul, kategori, dan video dari semua kategori', async () => {
    renderHome()

    expect(screen.getByRole('heading', { name: 'Indonesia Hari Ini', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Politik' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pengembangan Diri' })).toBeInTheDocument()

    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(10))
    expect(screen.getAllByText('1,2 rb ditonton · 1 hari lalu')).toHaveLength(10)
    expect(screen.getAllByText('10:05').length).toBeGreaterThan(0)
  })

  it('menyaring video saat kategori dipilih', async () => {
    renderHome()
    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(10))

    await userEvent.click(screen.getByRole('button', { name: 'Investasi' }))

    await waitFor(() => expect(screen.getAllByRole('link', { name: /ditonton/ })).toHaveLength(2))
    expect(screen.getByText('investasi saham indonesia pertama')).toBeInTheDocument()
  })

  it('menampilkan pesan dan tombol coba lagi saat API gagal', async () => {
    vi.mocked(getSearch).mockRejectedValue(new Error('Server video tidak bisa dihubungi.'))
    renderHome()

    expect(await screen.findByRole('alert')).toHaveTextContent('Server video tidak bisa dihubungi.')
    expect(screen.getByRole('button', { name: /Coba lagi/ })).toBeInTheDocument()
  })
})
