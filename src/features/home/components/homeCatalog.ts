import { getSearchKey } from '@/features/search/services/searchServices'
import type { PayloadGetSearch } from '@/features/search/types/searchTypes'

export type HomeCategoryName = 'Politik' | 'Ekonomi' | 'Investasi'

export interface HomeCategory {
  name: HomeCategoryName
  key: string
  payload: PayloadGetSearch
}

export const HOME_ALL_CATEGORY = 'Semua'

// Setiap kategori wajib berisi 100 video yang terbit paling lama 48 jam lalu, 15% di antaranya Shorts
export const HOME_VIDEOS_PER_CATEGORY = 100
export const HOME_MAX_AGE_HOURS = 48
export const HOME_SHORTS_PERCENT = 15

const getPayload = (queries: string[]): PayloadGetSearch => ({
  q: queries,
  maxAgeHours: HOME_MAX_AGE_HOURS,
  shortsPercent: HOME_SHORTS_PERCENT,
  period: 'week',
  sort: 'date',
  page: 1,
  limit: HOME_VIDEOS_PER_CATEGORY,
})

// Satu kata kunci jarang menghasilkan 100 video dalam 48 jam, jadi tiap kategori memakai beberapa
const getCategory = (name: HomeCategoryName, queries: string[]): HomeCategory => {
  const payload = getPayload(queries)
  return { name, key: getSearchKey(payload), payload }
}

export const HOME_CATEGORIES: HomeCategory[] = [
  getCategory('Politik', ['politik indonesia', 'berita politik hari ini', 'DPR RI', 'prabowo']),
  getCategory('Ekonomi', ['ekonomi indonesia', 'berita ekonomi hari ini', 'rupiah hari ini', 'harga emas hari ini']),
  getCategory('Investasi', ['IHSG', 'saham hari ini', 'investasi saham', 'kripto hari ini']),
]

export const HOME_ALL_PAYLOADS: PayloadGetSearch[] = HOME_CATEGORIES.map((category) => category.payload)
