import { useSyncExternalStore } from 'react'

import { getLocalCache, postLocalCache } from './localCache'

// Data tontonan per browser: posisi tiap video (untuk melanjutkan & bar merah di kartu) dan
// pilihan "putar otomatis video berikutnya". Semuanya di localStorage, tanpa server.

const PROGRESS_KEY = 'watch-progress:'
const PROGRESS_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const AUTOPLAY_KEY = 'blayer-autoplay-next'
const CHANGE_EVENT = 'blayer-watch-preferences'

export interface WatchProgress {
  time: number
  duration: number
}

const notifyChange = () => window.dispatchEvent(new Event(CHANGE_EVENT))

const subscribe = (onChange: () => void) => {
  // storage = perubahan dari tab lain, CHANGE_EVENT = perubahan dari tab ini
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

export const getWatchProgress = (videoId: string): WatchProgress | null => {
  const saved = getLocalCache<WatchProgress | number>(PROGRESS_KEY + videoId, PROGRESS_MAX_AGE_MS)
  // Versi lama hanya menyimpan detik tanpa durasi
  if (typeof saved === 'number') return { time: saved, duration: 0 }
  if (!saved || typeof saved.time !== 'number') return null
  return { time: saved.time, duration: typeof saved.duration === 'number' ? saved.duration : 0 }
}

export const postWatchProgress = (videoId: string, progress: WatchProgress) => {
  postLocalCache(PROGRESS_KEY + videoId, { time: Math.floor(progress.time), duration: Math.floor(progress.duration) })
  notifyChange()
}

// Porsi video yang sudah ditonton, 0 sampai 1; dipakai bar merah di thumbnail
export const getWatchedFraction = (progress: WatchProgress | null) => {
  if (!progress || progress.duration <= 0) return 0
  return Math.min(1, Math.max(0, progress.time / progress.duration))
}

export const useWatchedFraction = (videoId: string) =>
  useSyncExternalStore(
    subscribe,
    () => getWatchedFraction(getWatchProgress(videoId)),
    () => 0,
  )

const getAutoplayNext = () => {
  try {
    return window.localStorage.getItem(AUTOPLAY_KEY) === '1'
  } catch {
    return false
  }
}

export const postAutoplayNext = (isOn: boolean) => {
  try {
    window.localStorage.setItem(AUTOPLAY_KEY, isOn ? '1' : '0')
  } catch {
    // penyimpanan diblokir; pilihan tidak bertahan setelah refresh
  }
  notifyChange()
}

export const useAutoplayNext = () => useSyncExternalStore(subscribe, getAutoplayNext, () => false)
