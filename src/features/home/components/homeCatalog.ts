import type { PayloadGetSearch } from '@/features/search/types/searchTypes'

export type HomeCategoryName = 'Politik' | 'Ekonomi' | 'Investasi' | 'Psikologi' | 'Pengembangan Diri'

export interface HomeCategory {
  name: HomeCategoryName
  query: string
}

export const HOME_ALL_CATEGORY = 'Semua'

// Setiap kategori adalah kata kunci pencarian YouTube; "Semua" menggabungkan semuanya
export const HOME_CATEGORIES: HomeCategory[] = [
  { name: 'Politik', query: 'politik indonesia terbaru' },
  { name: 'Ekonomi', query: 'ekonomi indonesia terbaru' },
  { name: 'Investasi', query: 'investasi saham indonesia' },
  { name: 'Psikologi', query: 'psikologi kesehatan mental' },
  { name: 'Pengembangan Diri', query: 'pengembangan diri' },
]

export const HOME_SEARCH_DEFAULTS: Omit<PayloadGetSearch, 'q'> = {
  period: 'week',
  sort: 'relevance',
  page: 1,
  limit: 12,
}

export const HOME_ALL_PAYLOADS: PayloadGetSearch[] = HOME_CATEGORIES.map((category) => ({
  ...HOME_SEARCH_DEFAULTS,
  q: category.query,
}))
