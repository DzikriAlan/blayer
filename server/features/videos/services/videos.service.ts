import {
  HttpError,
  notFoundError,
  serviceUnavailableError,
} from '../../../shared/http-error'
import { getPagination } from '../../../shared/response'
import { getErrorFields, logger } from '../../../shared/utils/logger.util'
import {
  VIDEOS_CATEGORIES,
  VIDEOS_PER_CATEGORY,
  VIDEOS_RETENTION_HOURS,
  VIDEOS_SCRAPE_MAX_AGE_HOURS,
  VIDEOS_SHORTS_PERCENT,
} from '../constants/videos.categories'
import type { ListVideosDto, SearchVideosDto } from '../dto/videos.dto'
import {
  videosRepository,
  VideosSourceError,
  type VideosRepository,
  type VideosSearchEntity,
} from '../repositories/videos.repository'
import {
  videosStoreRepository,
  type VideosStoreEntity,
  type VideosStoreRepository,
} from '../repositories/videosStore.repository'

const CACHE_MS = 30 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000
const VIDEOS_CANDIDATE_RATIO = 1.4

// Cache singkat di memori supaya panggilan berulang tidak kembali ke YouTube
// dan memancing captcha.
const cache = new Map<string, { at: number; data: unknown }>()

const getCached = async <T>(key: string, load: () => Promise<T>) => {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data as T

  const data = await load()
  cache.set(key, { at: Date.now(), data })

  return data
}

// Kegagalan sumber YouTube diterjemahkan ke error HTTP yang bisa dibaca pemanggil
const getSourceError = (error: unknown) => {
  if (!(error instanceof VideosSourceError)) return error

  if (error.reason === 'NOT_FOUND') return notFoundError('VIDEO_NOT_FOUND', error.message)

  if (error.reason === 'BLOCKED') {
    return new HttpError(
      429,
      'YOUTUBE_RATE_LIMITED',
      'YouTube sedang membatasi permintaan, coba lagi beberapa menit lagi.'
    )
  }

  return serviceUnavailableError('YOUTUBE_UNAVAILABLE', error.message)
}

// Hasil pencarian YouTube -> baris tabel videos. Umur dari YouTube ("16 jam lalu") diubah
// jadi waktu terbit supaya tetap benar saat dibaca hari-hari berikutnya.
const getStoredRow = (row: VideosSearchEntity, category: string, scrapedAt: Date): VideosStoreEntity => ({
  id: row.id,
  category,
  url: row.url,
  isShort: row.isShort,
  title: row.title,
  channel: row.channel,
  channelId: row.channelId,
  channelUrl: row.channelUrl,
  verifiedChannel: row.verifiedChannel,
  duration: row.duration,
  views: row.views,
  isLive: row.isLive,
  thumbnail: row.thumbnail,
  publishedAt: new Date(scrapedAt.getTime() - (row.publishedHoursAgo ?? 0) * HOUR_MS),
  scrapedAt,
})

export class VideosService {
  constructor(
    private readonly videosRepository: VideosRepository,
    private readonly videosStoreRepository: VideosStoreRepository
  ) {}

  // Dibaca browser sekali sehari; dengan `since` hanya video hasil scrape setelahnya
  async fetchVideosList({ since }: ListVideosDto) {
    const publishedAfter = new Date(Date.now() - VIDEOS_RETENTION_HOURS * HOUR_MS)
    const [videos, syncedAt] = await Promise.all([
      this.videosStoreRepository.getVideosStored({ publishedAfter, since }),
      this.videosStoreRepository.getVideosSyncedAt(),
    ])

    return { syncedAt: syncedAt?.toISOString() ?? null, videos }
  }

  // Scrape harian: 100 video terbaru per kategori (yang judul aslinya berbahasa Indonesia) masuk ke basis data, lalu video yang
  // terbit lebih dari 3 hari lalu dihapus. Kategori yang gagal dilewati agar kategori
  // lain tetap terisi; kalau semuanya gagal, error terakhir dilempar.
  async postVideosSync(scrapedAt = new Date()) {
    const rows: VideosStoreEntity[] = []
    const categories: { name: string; total: number; error?: string }[] = []
    let lastError: unknown = null
    const shortsMax = Math.round((VIDEOS_PER_CATEGORY * VIDEOS_SHORTS_PERCENT) / 100)

    for (const category of VIDEOS_CATEGORIES) {
      try {
        // Kandidat dilebihkan karena sebagian gugur saat judul aslinya dicek
        const candidates = await this.videosRepository.getVideosMix({
          queries: [...category.queries],
          sort: 'date',
          max: Math.round(VIDEOS_PER_CATEGORY * VIDEOS_CANDIDATE_RATIO),
          shortsMax: Math.round(shortsMax * VIDEOS_CANDIDATE_RATIO),
          maxAgeHours: VIDEOS_SCRAPE_MAX_AGE_HOURS,
        })
        const verified = await this.videosRepository.getVideosIndonesian(candidates)
        const shorts = verified.filter((row) => row.isShort).slice(0, shortsMax)
        const found = [...verified.filter((row) => !row.isShort).slice(0, VIDEOS_PER_CATEGORY - shorts.length), ...shorts]
        rows.push(...found.map((row) => getStoredRow(row, category.name, scrapedAt)))
        categories.push({ name: category.name, total: found.length })
      } catch (error) {
        lastError = error
        categories.push({ name: category.name, total: 0, error: error instanceof Error ? error.message : String(error) })
        logger.warn('scrape kategori gagal', { category: category.name, ...getErrorFields(error) })
      }
    }

    if (!rows.length && lastError) throw getSourceError(lastError)

    await this.videosStoreRepository.postVideosStored(rows)
    const deleted = await this.videosStoreRepository.deleteVideosStored(
      new Date(scrapedAt.getTime() - VIDEOS_RETENTION_HOURS * HOUR_MS)
    )

    return { scrapedAt: scrapedAt.toISOString(), saved: rows.length, deleted, categories }
  }

  async fetchVideosSearch(dto: SearchVideosDto) {
    const { q: queries, period, sort, page, limit, maxAgeHours, shortsPercent } = dto

    // Satu item lebih dari halaman ini dikumpulkan supaya ketahuan ada halaman
    // berikutnya. Jendela waktu, beberapa kata kunci, atau porsi Shorts memakai
    // mix yang menggabungkan dan mengurutkan dari yang terbaru.
    const max = page * limit + 1
    const shortsMax = Math.round((page * limit * shortsPercent) / 100)
    const isMix = queries.length > 1 || maxAgeHours > 0 || shortsPercent > 0

    try {
      const collected = await getCached(
        `search:${queries.join('|')}:${period}:${sort}:${maxAgeHours}:${shortsPercent}:${max}`,
        () =>
          isMix
            ? this.videosRepository.getVideosMix({ queries, sort, max, shortsMax, maxAgeHours })
            : this.videosRepository.getVideosSearch({ query: queries[0], period, sort, max })
      )
      const pagination = getPagination(page, limit, collected.length)

      return {
        data: collected.slice((page - 1) * limit, page * limit),
        pagination: { ...pagination, totalPages: Math.max(1, pagination.totalPages) },
      }
    } catch (error) {
      throw getSourceError(error)
    }
  }

  async fetchVideosDetail(videoId: string) {
    try {
      return await getCached(`video:${videoId}`, () =>
        this.videosRepository.getVideosDetail(videoId)
      )
    } catch (error) {
      throw getSourceError(error)
    }
  }
}

export const videosService = new VideosService(videosRepository, videosStoreRepository)
