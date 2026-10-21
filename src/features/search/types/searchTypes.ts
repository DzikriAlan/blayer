// Satu baris tabel videos di Supabase, hasil scrape harian jam 10.00 WIB
export interface DataSearch {
  id: string
  category: string
  url: string
  isShort: boolean
  title: string
  channel: string
  channelId: string
  channelUrl: string
  verifiedChannel: boolean
  duration: string
  views: number
  isLive: boolean
  thumbnail: string
  publishedAt: string
  scrapedAt: string
}

export interface DataSearchList {
  // Waktu scrape terakhir di basis data; null kalau tabelnya masih kosong
  syncedAt: string | null
  videos: DataSearch[]
}

// Isi localStorage: seluruh video yang pernah diambil dan masih dalam masa simpan
export interface StoredSearchList {
  syncedAt: string | null
  checkedAt: number
  videos: DataSearch[]
}

// Satu kelompok video per kategori, supaya beranda bisa memberi label kategori
export interface DataSearchGroup {
  key: string
  items: DataSearch[]
}

export interface SearchList {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataSearchGroup[]
}
