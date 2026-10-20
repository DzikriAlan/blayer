// Penyimpanan data API di browser. Setiap nilai di-JSON.stringify bersama waktu
// simpannya, lalu di-JSON.parse saat dibaca. Tidak ada basis data: kalau entri
// sudah kedaluwarsa, rusak, atau localStorage diblokir, pemanggil cukup mengambil
// ulang dari API.

const CACHE_PREFIX = 'blayer.cache.'

interface CacheEntry<T> {
  savedAt: number
  value: T
}

export const getLocalCache = <T>(key: string, maxAgeMs: number): T | null => {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null

    const entry = JSON.parse(raw) as Partial<CacheEntry<T>>
    if (typeof entry.savedAt !== 'number' || entry.value === undefined) return null
    if (Date.now() - entry.savedAt > maxAgeMs) return null

    return entry.value
  } catch {
    return null
  }
}

export const postLocalCache = <T>(key: string, value: T) => {
  const entry: CacheEntry<T> = { savedAt: Date.now(), value }

  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch {
    // Kuota penuh atau mode privat: data tetap dipakai dari memori untuk sesi ini
  }
}
