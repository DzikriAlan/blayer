// Kategori beranda beserta kata kunci pencariannya. Scraper harian membaca
// daftar ini; beranda hanya memakai namanya.
export const VIDEOS_CATEGORIES = [
  { name: 'Politik', queries: ['politik indonesia', 'berita politik hari ini', 'DPR RI', 'prabowo'] },
  { name: 'Ekonomi', queries: ['ekonomi indonesia', 'berita ekonomi hari ini', 'rupiah hari ini', 'harga emas hari ini'] },
  { name: 'Kriminal', queries: ['berita kriminal hari ini', 'kasus kriminal terbaru', 'polisi tangkap', 'kasus pembunuhan indonesia'] },
] as const

export type VideosCategoryName = (typeof VIDEOS_CATEGORIES)[number]['name']

// Tiap kategori diisi 100 video terbaru (15% Shorts) yang terbit paling lama 48 jam
// sebelum scrape; video yang sudah lewat 3 hari dihapus dari basis data.
export const VIDEOS_PER_CATEGORY = 100
export const VIDEOS_SHORTS_PERCENT = 15
export const VIDEOS_SCRAPE_MAX_AGE_HOURS = 48
export const VIDEOS_RETENTION_HOURS = 72
