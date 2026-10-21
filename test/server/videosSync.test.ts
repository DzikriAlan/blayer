import { beforeEach, describe, expect, it, vi } from 'vitest'

import { VideosService } from '@server/features/videos/services/videos.service'
import {
  VideosSourceError,
  isIndonesian,
  type VideosRepository,
  type VideosSearchEntity,
} from '@server/features/videos/repositories/videos.repository'
import type { VideosStoreRepository } from '@server/features/videos/repositories/videosStore.repository'
import { muteLogger } from '../helpers/apiTest'

const SCRAPED_AT = new Date('2026-10-21T03:00:00.000Z')
const HOUR = 60 * 60 * 1000

const getRow = (id: string, publishedHoursAgo: number | null): VideosSearchEntity => ({
  id,
  url: `https://www.youtube.com/watch?v=${id}`,
  isShort: false,
  embedUrl: `https://www.youtube.com/embed/${id}`,
  title: `Berita ${id} hari ini`,
  channel: 'Kanal',
  channelId: 'UC1',
  channelUrl: '',
  verifiedChannel: true,
  published: '',
  publishedHoursAgo,
  duration: '3.10',
  views: 50,
  isLive: publishedHoursAgo === null,
  snippet: 'cuplikan',
  thumbnail: 'https://i.ytimg.com/x.jpg',
})

const getService = () => {
  const source = {
    getVideosMix: vi.fn(),
    getVideosIndonesian: vi.fn(async (rows: VideosSearchEntity[]) => rows),
  }
  const store = {
    postVideosStored: vi.fn().mockResolvedValue(undefined),
    deleteVideosStored: vi.fn().mockResolvedValue(4),
  }
  const service = new VideosService(source as unknown as VideosRepository, store as unknown as VideosStoreRepository)
  return { service, source, store }
}

beforeEach(() => {
  muteLogger()
})

describe('scrape harian', () => {
  it('menyimpan 100 video (15 Shorts) per kategori 48 jam terakhir lalu menghapus yang lewat 3 hari', async () => {
    const { service, source, store } = getService()
    source.getVideosMix.mockResolvedValue([getRow('a', 5), getRow('live', null)])

    const result = await service.postVideosSync(SCRAPED_AT)

    expect(source.getVideosMix).toHaveBeenCalledTimes(3)
    expect(source.getVideosMix).toHaveBeenCalledWith(
      // Kandidat dilebihkan 40% karena sebagian gugur saat judul aslinya dicek
      expect.objectContaining({ sort: 'date', max: 140, shortsMax: 21, maxAgeHours: 48 })
    )
    const rows = store.postVideosStored.mock.calls[0][0]
    expect(rows).toHaveLength(6)
    expect(rows.map((row: { category: string }) => row.category)).toEqual(['Politik', 'Politik', 'Ekonomi', 'Ekonomi', 'Kriminal', 'Kriminal'])
    expect(rows[0]).toMatchObject({ id: 'a', publishedAt: new Date(SCRAPED_AT.getTime() - 5 * HOUR), scrapedAt: SCRAPED_AT })
    expect(rows[0]).not.toHaveProperty('snippet')
    // Live tanpa umur dianggap terbit saat di-scrape
    expect(rows[1].publishedAt).toEqual(SCRAPED_AT)
    expect(store.deleteVideosStored).toHaveBeenCalledWith(new Date(SCRAPED_AT.getTime() - 72 * HOUR))
    expect(result).toMatchObject({ saved: 6, deleted: 4 })
  })

  it('membuang video yang judul aslinya bukan Indonesia lalu memotong ke 85 video + 15 Shorts', async () => {
    const { service, source, store } = getService()
    const videos = Array.from({ length: 120 }, (_, index) => getRow(`v${index}`, 1))
    const shorts = Array.from({ length: 20 }, (_, index) => ({ ...getRow(`s${index}`, 1), isShort: true }))
    source.getVideosMix.mockResolvedValue([...videos, ...shorts])
    source.getVideosIndonesian.mockImplementation(async (rows: VideosSearchEntity[]) => rows.filter((row) => row.id !== 'v0'))

    await service.postVideosSync(SCRAPED_AT)

    const rows = store.postVideosStored.mock.calls[0][0].filter((row: { category: string }) => row.category === 'Politik')
    expect(rows).toHaveLength(100)
    expect(rows.filter((row: { isShort: boolean }) => row.isShort)).toHaveLength(15)
    expect(rows.some((row: { id: string }) => row.id === 'v0')).toBe(false)
  })

  it('kategori yang gagal dilewati, kategori lain tetap disimpan', async () => {
    const { service, source, store } = getService()
    source.getVideosMix
      .mockRejectedValueOnce(new VideosSourceError('BLOCKED', 'captcha'))
      .mockResolvedValue([getRow('b', 1)])

    const result = await service.postVideosSync(SCRAPED_AT)

    expect(store.postVideosStored.mock.calls[0][0]).toHaveLength(2)
    expect(result.categories[0]).toEqual({ name: 'Politik', total: 0, error: 'captcha' })
  })

  it('semua kategori gagal: tidak menyentuh basis data', async () => {
    const { service, source, store } = getService()
    source.getVideosMix.mockRejectedValue(new VideosSourceError('BLOCKED', 'captcha'))

    await expect(service.postVideosSync(SCRAPED_AT)).rejects.toMatchObject({ status: 429 })
    expect(store.postVideosStored).not.toHaveBeenCalled()
    expect(store.deleteVideosStored).not.toHaveBeenCalled()
  })
})

describe('isIndonesian', () => {
  const getText = (title: string, channel = 'Kanal', snippet = '') => ({ title, channel, snippet })

  it('menerima judul berbahasa Indonesia', () => {
    expect(isIndonesian(getText('BUSYET!! AKHIR DRAMA PRAHARA MSCI = SERET NAMA SINGAPURA'))).toBe(true)
    expect(isIndonesian(getText('KENAPA IKN HARUS DI KALIMANTAN? INI ALASAN BESAR DI BALIK PEMINDAHAN IBU KOTA INDONESIA!!'))).toBe(true)
    expect(isIndonesian(getText('alasan indonesia dekat dengan rusia'))).toBe(true)
    expect(isIndonesian(getText('Polisi tangkap pelaku pencurian di Bekasi'))).toBe(true)
    expect(isIndonesian(getText('Breaking!', 'Kanal', 'Presiden Prabowo resmikan proyek'))).toBe(true)
  })

  it('menolak judul berhuruf non-Latin, media Malaysia, dan bahasa lain', () => {
    expect(isIndonesian(getText('पुलिस ने पकड़ा di Jakarta'))).toBe(false)
    expect(isIndonesian(getText('Polis tahan suspek di Johor'))).toBe(false)
    expect(isIndonesian(getText('Berita hari ini', 'Berita Malaysia'))).toBe(false)
    // Judul terjemahan otomatis YouTube dari channel Korea
    expect(isIndonesian(getText('Lagi-lagi anak di bawah umur?', 'SBS 뉴스'))).toBe(false)
    expect(isIndonesian(getText('Stock market update today'))).toBe(false)
    // Media asing berbahasa Inggris yang menyebut Indonesia atau tokohnya
    expect(isIndonesian(getText("Why Indonesia's Stock Market is in Crisis", 'India Global Review'))).toBe(false)
    expect(isIndonesian(getText("Thousands protest across Indonesia on 2nd anniversary of Prabowo's presidency", 'The Straits Times'))).toBe(false)
    expect(isIndonesian(getText("Indonesia's Biggest Stock Market Crash Since 1998: What Went Wrong?", 'Firstpost'))).toBe(false)
  })
})

describe('getVideosIndonesian', () => {
  const getOembed = (status: number, body: Record<string, string> = {}) =>
    ({ ok: status < 300, status, json: async () => body }) as Response

  it('memakai judul asli dari oEmbed, dan membuang video yang tidak boleh di-embed', async () => {
    const { VideosRepository } = await import('@server/features/videos/repositories/videos.repository')
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('asing')) return getOembed(200, { title: 'MP reveals threatening message', author_name: '10 News' })
      if (url.includes('tertutup')) return getOembed(401)
      if (url.includes('sibuk')) return getOembed(503)
      return getOembed(200, { title: 'Polisi tangkap pelaku', author_name: 'Kanal' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const rows = ['lokal', 'asing', 'tertutup', 'sibuk'].map((id) => getRow(id, 1))
    const kept = await new VideosRepository().getVideosIndonesian(rows)

    expect(kept.map((row) => row.id)).toEqual(['lokal', 'sibuk'])
    vi.unstubAllGlobals()
  })
})
