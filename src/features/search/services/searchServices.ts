import { getVideoApi, type VideoApiEnvelope } from '@/shared/lib/videoClient'
import type { DataSearch, DataSearchList, StoredSearchList } from '../types/searchTypes'

// Video beranda diambil dari basis data sekali sehari lalu disimpan di localStorage.
// Data baru masuk ke basis data jam 10.00 WIB; sebelum batas itu terlewati, kunjungan
// berikutnya cukup membaca localStorage tanpa memanggil API.
const STORE_KEY = 'blayer.videos'
const HOUR_MS = 60 * 60 * 1000
export const SEARCH_RETENTION_MS = 72 * HOUR_MS
// 10.00 WIB (UTC+7, tanpa musim panas) = 03.00 UTC
const SYNC_HOUR_UTC = 3
// Scrape bisa terlambat dari jadwal; selama data hari ini belum masuk, cek ulang paling cepat tiap 30 menit
const RECHECK_MS = 30 * 60 * 1000
const LEGACY_CACHE_PREFIX = 'blayer.cache.search:'

// Batas jam 10.00 WIB terakhir yang sudah lewat
export const getSyncBoundary = (now: number) => {
  const date = new Date(now)
  const boundary = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), SYNC_HOUR_UTC)
  return boundary <= now ? boundary : boundary - 24 * HOUR_MS
}

const getStored = (): StoredSearchList | null => {
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as Partial<StoredSearchList>
    if (!Array.isArray(stored.videos) || typeof stored.checkedAt !== 'number') return null
    return { syncedAt: stored.syncedAt ?? null, checkedAt: stored.checkedAt, videos: stored.videos }
  } catch {
    return null
  }
}

const postStored = (stored: StoredSearchList) => {
  try {
    // Cache per kata kunci dari versi sebelumnya (pencarian langsung ke YouTube) sudah tidak dipakai
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(LEGACY_CACHE_PREFIX))
      .forEach((key) => window.localStorage.removeItem(key))

    window.localStorage.setItem(STORE_KEY, JSON.stringify(stored))
  } catch {
    // Kuota penuh atau mode privat: data tetap dipakai dari memori untuk sesi ini
  }
}

// Video yang terbit lebih dari 3 hari lalu dibuang, sama seperti di basis data
const getAlive = (videos: DataSearch[], now: number) =>
  videos.filter((video) => now - Date.parse(video.publishedAt) <= SEARCH_RETENTION_MS)

// Video baru menimpa versi lama (views terbaru) dengan kunci kategori + id
const getMerged = (current: DataSearch[], incoming: DataSearch[]) => {
  const byKey = new Map(current.map((video) => [`${video.category}:${video.id}`, video]))
  for (const video of incoming) byKey.set(`${video.category}:${video.id}`, video)
  return [...byKey.values()].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
}

export const getSearchList = async (now = Date.now()): Promise<DataSearch[]> => {
  const stored = getStored()
  const boundary = getSyncBoundary(now)

  if (stored) {
    const isSynced = !!stored.syncedAt && Date.parse(stored.syncedAt) >= boundary
    const isRecentlyChecked = stored.checkedAt >= boundary && now - stored.checkedAt < RECHECK_MS
    if (isSynced || isRecentlyChecked) return getAlive(stored.videos, now)
  }

  // Hanya video hasil scrape setelah data terakhir yang dimiliki browser ini
  const since = stored?.syncedAt ? `?since=${encodeURIComponent(stored.syncedAt)}` : ''
  let body: VideoApiEnvelope<DataSearchList>
  try {
    body = await getVideoApi<DataSearchList>(since)
  } catch (error) {
    // Tanpa koneksi, data kemarin masih lebih baik daripada layar kosong
    if (stored?.videos.length) return getAlive(stored.videos, now)
    throw error
  }

  const videos = getAlive(getMerged(stored?.videos ?? [], body.data?.videos ?? []), now)
  postStored({ syncedAt: body.data?.syncedAt ?? stored?.syncedAt ?? null, checkedAt: now, videos })
  return videos
}
