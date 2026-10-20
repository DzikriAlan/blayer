import { getLocalCache, postLocalCache } from '@/shared/lib/localCache'
import { getYtTopic } from '@/shared/lib/ytTopicClient'
import type { DataSearch, DataSearchResult, PayloadGetSearch } from '../types/searchTypes'

const SEARCH_CACHE_MS = 30 * 60 * 1000

export const getSearch = async (payload: PayloadGetSearch) => {
  const cacheKey = `search:${payload.q}:${payload.period}:${payload.sort}:${payload.page}:${payload.limit}`
  const cachedResult = getLocalCache<DataSearchResult>(cacheKey, SEARCH_CACHE_MS)
  if (cachedResult) return cachedResult

  const queryString = new URLSearchParams({
    q: payload.q,
    period: payload.period,
    sort: payload.sort,
    page: String(payload.page),
    limit: String(payload.limit),
  }).toString()
  const body = await getYtTopic<DataSearch[]>(`/search?${queryString}`)
  const result: DataSearchResult = {
    data: body.data ?? [],
    pagination: body.pagination ?? { page: payload.page, limit: payload.limit, total: 0, totalPages: 1 },
  }

  postLocalCache(cacheKey, result)
  return result
}
