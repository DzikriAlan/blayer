import { getLocalCache, postLocalCache } from '@/shared/lib/localCache'
import { getVideoApi } from '@/shared/lib/videoClient'
import type { DataSearch, DataSearchResult, PayloadGetSearch } from '../types/searchTypes'

const SEARCH_CACHE_MS = 30 * 60 * 1000

// Kunci stabil untuk satu payload; dipakai cache localStorage dan pengelompokan hasil
export const getSearchKey = (payload: Pick<PayloadGetSearch, 'q'>) => payload.q.join('|')

export const getSearch = async (payload: PayloadGetSearch) => {
  const cacheKey = `search:${getSearchKey(payload)}:${payload.maxAgeHours}:${payload.shortsPercent}:${payload.period}:${payload.sort}:${payload.page}:${payload.limit}`
  const cachedResult = getLocalCache<DataSearchResult>(cacheKey, SEARCH_CACHE_MS)
  if (cachedResult) return cachedResult

  const queryString = new URLSearchParams([
    ...payload.q.map((query) => ['q', query]),
    ['maxAgeHours', String(payload.maxAgeHours)],
    ['shortsPercent', String(payload.shortsPercent)],
    ['period', payload.period],
    ['sort', payload.sort],
    ['page', String(payload.page)],
    ['limit', String(payload.limit)],
  ]).toString()
  const body = await getVideoApi<DataSearch[]>(`/search?${queryString}`)
  const result: DataSearchResult = {
    data: body.data ?? [],
    pagination: body.pagination ?? { page: payload.page, limit: payload.limit, total: 0, totalPages: 1 },
  }

  postLocalCache(cacheKey, result)
  return result
}
