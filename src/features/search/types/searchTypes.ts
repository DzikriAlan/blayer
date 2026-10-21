import type { VideoApiPagination } from '@/shared/lib/videoClient'

export type SearchPeriod = 'hour' | 'today' | 'week' | 'month' | 'year' | 'all'
export type SearchSort = 'date' | 'relevance' | 'views'

export interface PayloadGetSearch {
  // Beberapa kata kunci digabung jadi satu daftar oleh server (parameter q berulang)
  q: string[]
  maxAgeHours: number
  // Persentase Shorts dalam hasil, mis. 15 -> 15 Shorts dan 85 video biasa per 100
  shortsPercent: number
  period: SearchPeriod
  sort: SearchSort
  page: number
  limit: number
}

export interface DataSearch {
  id: string
  url: string
  isShort: boolean
  embedUrl: string
  title: string
  channel: string
  channelId: string
  channelUrl: string
  verifiedChannel: boolean
  published: string
  publishedHoursAgo: number | null
  duration: string
  views: number
  isLive: boolean
  snippet: string
  thumbnail: string
}

export interface DataSearchResult {
  data: DataSearch[]
  pagination: VideoApiPagination
}

// Satu kelompok hasil per payload, supaya beranda bisa memberi label kategori
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
