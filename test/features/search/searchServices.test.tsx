import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getSearchList, getSyncBoundary } from '@/features/search/services/searchServices'
import type { DataSearch } from '@/features/search/types/searchTypes'
import { getVideoApi } from '@/shared/lib/videoClient'

vi.mock('@/shared/lib/videoClient', () => ({ getVideoApi: vi.fn() }))

const HOUR = 60 * 60 * 1000
// 21 Okt 2026 12.00 WIB (05.00 UTC): scrape hari ini (10.00 WIB) sudah lewat
const NOON = Date.UTC(2026, 9, 21, 5)
const TODAY_SYNC = Date.UTC(2026, 9, 21, 3)
const YESTERDAY_SYNC = TODAY_SYNC - 24 * HOUR

const getVideo = (id: string, publishedAt: number, views = 100): DataSearch => ({
  id,
  category: 'Politik',
  url: `https://www.youtube.com/watch?v=${id}`,
  isShort: false,
  title: id,
  channel: 'Kanal',
  channelId: 'UC1',
  channelUrl: '',
  verifiedChannel: false,
  duration: '1.00',
  views,
  isLive: false,
  thumbnail: '',
  publishedAt: new Date(publishedAt).toISOString(),
  scrapedAt: new Date(publishedAt).toISOString(),
})

const getStored = () => JSON.parse(window.localStorage.getItem('blayer.videos') ?? 'null')

const postStored = (value: unknown) => window.localStorage.setItem('blayer.videos', JSON.stringify(value))

const mockApi = (videos: DataSearch[], syncedAt: number | null) =>
  vi.mocked(getVideoApi).mockResolvedValue({
    success: true,
    data: { syncedAt: syncedAt === null ? null : new Date(syncedAt).toISOString(), videos },
  })

beforeEach(() => {
  window.localStorage.clear()
  vi.mocked(getVideoApi).mockReset()
})

afterEach(() => {
  window.localStorage.clear()
})

describe('getSyncBoundary', () => {
  it('memakai jam 10.00 WIB hari ini setelah jam itu lewat', () => {
    expect(getSyncBoundary(NOON)).toBe(TODAY_SYNC)
    expect(getSyncBoundary(TODAY_SYNC)).toBe(TODAY_SYNC)
  })

  it('memakai jam 10.00 WIB kemarin sebelum jam itu tiba', () => {
    // 21 Okt 09.59 WIB
    expect(getSyncBoundary(TODAY_SYNC - 60_000)).toBe(YESTERDAY_SYNC)
  })
})

describe('getSearchList', () => {
  it('kunjungan pertama mengambil semua video dari basis data lalu menyimpannya', async () => {
    mockApi([getVideo('a', NOON - 5 * HOUR)], TODAY_SYNC + 10 * 60_000)

    const videos = await getSearchList(NOON)

    expect(getVideoApi).toHaveBeenCalledWith('')
    expect(videos.map((video) => video.id)).toEqual(['a'])
    expect(getStored()).toMatchObject({ syncedAt: new Date(TODAY_SYNC + 10 * 60_000).toISOString(), checkedAt: NOON })
  })

  it('kunjungan berikutnya di hari yang sama hanya membaca localStorage', async () => {
    postStored({ syncedAt: new Date(TODAY_SYNC + 10 * 60_000).toISOString(), checkedAt: NOON, videos: [getVideo('a', NOON - HOUR)] })

    const videos = await getSearchList(NOON + 8 * HOUR)

    expect(getVideoApi).not.toHaveBeenCalled()
    expect(videos.map((video) => video.id)).toEqual(['a'])
  })

  it('hari berikutnya mengambil video baru saja, menghapus yang lewat 3 hari, dan memperbarui yang sama', async () => {
    const yesterdaySyncedAt = new Date(YESTERDAY_SYNC + 5 * 60_000).toISOString()
    postStored({
      syncedAt: yesterdaySyncedAt,
      checkedAt: YESTERDAY_SYNC + HOUR,
      videos: [getVideo('lama', NOON - 73 * HOUR), getVideo('kemarin', NOON - 20 * HOUR, 100)],
    })
    mockApi([getVideo('kemarin', NOON - 20 * HOUR, 900), getVideo('baru', NOON - 2 * HOUR)], TODAY_SYNC + 5 * 60_000)

    const videos = await getSearchList(NOON)

    expect(getVideoApi).toHaveBeenCalledWith(`?since=${encodeURIComponent(yesterdaySyncedAt)}`)
    expect(videos.map((video) => video.id)).toEqual(['baru', 'kemarin'])
    expect(videos.find((video) => video.id === 'kemarin')?.views).toBe(900)
    expect(getStored().videos).toHaveLength(2)
  })

  it('sebelum jam 10.00 WIB masih memakai data kemarin tanpa memanggil API', async () => {
    postStored({ syncedAt: new Date(YESTERDAY_SYNC + 60_000).toISOString(), checkedAt: YESTERDAY_SYNC + HOUR, videos: [getVideo('a', YESTERDAY_SYNC)] })

    await getSearchList(TODAY_SYNC - 60_000)

    expect(getVideoApi).not.toHaveBeenCalled()
  })

  it('scrape hari ini belum masuk: cek ulang paling cepat 30 menit kemudian', async () => {
    const yesterdaySyncedAt = new Date(YESTERDAY_SYNC + 60_000).toISOString()
    postStored({ syncedAt: yesterdaySyncedAt, checkedAt: YESTERDAY_SYNC + HOUR, videos: [] })
    mockApi([], YESTERDAY_SYNC + 60_000)

    await getSearchList(TODAY_SYNC + 5 * 60_000)
    await getSearchList(TODAY_SYNC + 20 * 60_000)
    expect(getVideoApi).toHaveBeenCalledTimes(1)

    await getSearchList(TODAY_SYNC + 40 * 60_000)
    expect(getVideoApi).toHaveBeenCalledTimes(2)
  })

  it('memakai data tersimpan kalau API gagal', async () => {
    postStored({ syncedAt: new Date(YESTERDAY_SYNC).toISOString(), checkedAt: YESTERDAY_SYNC, videos: [getVideo('a', NOON - HOUR)] })
    vi.mocked(getVideoApi).mockRejectedValue(new Error('offline'))

    const videos = await getSearchList(NOON)

    expect(videos.map((video) => video.id)).toEqual(['a'])
  })

  it('melempar error kalau API gagal dan belum ada data tersimpan', async () => {
    vi.mocked(getVideoApi).mockRejectedValue(new Error('offline'))

    await expect(getSearchList(NOON)).rejects.toThrow('offline')
  })

  it('membersihkan cache pencarian versi lama', async () => {
    window.localStorage.setItem('blayer.cache.search:politik', '{}')
    window.localStorage.setItem('blayer.cache.video:abc', '{}')
    mockApi([], TODAY_SYNC)

    await getSearchList(NOON)

    expect(window.localStorage.getItem('blayer.cache.search:politik')).toBeNull()
    expect(window.localStorage.getItem('blayer.cache.video:abc')).toBe('{}')
  })
})
