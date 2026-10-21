import {
  HttpError,
  notFoundError,
  serviceUnavailableError,
} from '../../../shared/http-error'
import { getPagination } from '../../../shared/response'
import type { SearchVideosDto } from '../dto/videos.dto'
import {
  videosRepository,
  VideosSourceError,
  type VideosRepository,
} from '../repositories/videos.repository'

const CACHE_MS = 30 * 60 * 1000

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

export class VideosService {
  constructor(private readonly videosRepository: VideosRepository) {}

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

export const videosService = new VideosService(videosRepository)
