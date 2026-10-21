import { getLocalCache, postLocalCache } from '@/shared/lib/localCache'
import { getVideoApi } from '@/shared/lib/videoClient'
import type { DataVideo, PayloadGetVideo } from '../types/videoTypes'

const VIDEO_CACHE_MS = 60 * 60 * 1000

export const getVideo = async (payload: PayloadGetVideo) => {
  const cacheKey = `video:${payload.id}`
  const cachedVideo = getLocalCache<DataVideo>(cacheKey, VIDEO_CACHE_MS)
  if (cachedVideo) return cachedVideo

  const body = await getVideoApi<DataVideo>(`/${encodeURIComponent(payload.id)}`)
  const video = body.data ?? null
  if (video) postLocalCache(cacheKey, video)
  return video
}
