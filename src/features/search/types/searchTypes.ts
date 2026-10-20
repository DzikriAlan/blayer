import type { YtTopicPagination } from '@/shared/lib/ytTopicClient'

export type SearchPeriod = 'hour' | 'today' | 'week' | 'month' | 'year' | 'all'
export type SearchSort = 'date' | 'relevance' | 'views'

export interface PayloadGetSearch {
  q: string
  period: SearchPeriod
  sort: SearchSort
  page: number
  limit: number
}

export interface DataSearch {
  id: string
  url: string
  embedUrl: string
  title: string
  channel: string
  channelId: string
  channelUrl: string
  verifiedChannel: boolean
  published: string
  duration: string
  views: number
  isLive: boolean
  snippet: string
  thumbnail: string
}

export interface DataSearchResult {
  data: DataSearch[]
  pagination: YtTopicPagination
}

// Satu kelompok hasil per query, supaya beranda bisa memberi label kategori
export interface DataSearchGroup {
  q: string
  items: DataSearch[]
}

export interface SearchList {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataSearchGroup[]
}
