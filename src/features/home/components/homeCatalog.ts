// Nama kategori beranda; kata kunci pencariannya ada di server
// (server/features/videos/constants/videos.categories.ts) karena scrape berjalan di sana.
export const HOME_CATEGORIES = ['Politik', 'Ekonomi', 'Kriminal'] as const

export type HomeCategoryName = (typeof HOME_CATEGORIES)[number]

export const HOME_ALL_CATEGORY = 'Semua'

// Video disimpan 3 hari sejak terbit, di basis data maupun di localStorage
export const HOME_RETENTION_DAYS = 3
