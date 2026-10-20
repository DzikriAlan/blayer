import { getLocalCache, postLocalCache } from '@/shared/lib/localCache'
import { getYtTopic } from '@/shared/lib/ytTopicClient'
import type { DataVideo, PayloadGetVideo } from '../types/videoTypes'

const VIDEO_CACHE_MS = 60 * 60 * 1000

export const getVideo = async (payload: PayloadGetVideo) => {
  const cacheKey = `video:${payload.id}`
  const cachedVideo = getLocalCache<DataVideo>(cacheKey, VIDEO_CACHE_MS)
  if (cachedVideo) return cachedVideo

  const body = await getYtTopic<DataVideo>(`/video/${encodeURIComponent(payload.id)}`)
  const video = body.data ?? null
  if (video) postLocalCache(cacheKey, video)
  return video
}
