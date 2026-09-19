import type { NextApiRequest } from 'next'

import { logger } from '@/shared/lib/logger'
import { tooManyRequestsError } from '../http-error'
import {
  getRateLimitStore,
  setRateLimitStore,
} from './rateLimitStore.service'

interface RateLimitOptions {
  name: string
  limit: number
  windowMs: number
  scope?: string
}

const getForwardedChain = (req: NextApiRequest) => {
  const forwarded = req.headers['x-forwarded-for']
  const raw = Array.isArray(forwarded) ? forwarded.join(',') : forwarded

  return (raw ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export const getClientIp = (req: NextApiRequest) => {
  const hops = Number(process.env.TRUST_PROXY_HOPS ?? 0)
  const socketIp = req.socket?.remoteAddress ?? 'unknown'

  if (!Number.isInteger(hops) || hops <= 0) return socketIp

  const chain = getForwardedChain(req)
  if (!chain.length) return socketIp

  const index = chain.length - hops
  return chain[index] ?? chain[0]
}

// Batas dilempar sebagai HttpError supaya route boundary yang menuliskannya,
// sama seperti kegagalan lain — tidak ada jalur response kedua.
export const enforceRateLimit = async (
  req: NextApiRequest,
  { name, limit, windowMs, scope = '' }: RateLimitOptions
) => {
  const now = Date.now()
  const ip = getClientIp(req)
  const key = `ratelimit:${name}:${scope}:${ip}`
  const store = getRateLimitStore()

  let hit

  try {
    hit = await store.add(key, now, windowMs)
  } catch (error) {
    logger.error('rate limit gagal membaca penyimpanan', {
      rule: name,
      store: store.name,
      message: error instanceof Error ? error.message : String(error),
    })

    // Penyimpanan yang bermasalah tidak boleh menutup layanan.
    return
  }

  if (hit.total <= limit) return

  await store.remove(key, now).catch(() => {})

  const retryAfter = Math.max(
    1,
    Math.ceil((windowMs - (now - hit.oldest)) / 1000)
  )

  logger.warn('rate limit tercapai', { rule: name, scope, ip, limit })

  throw tooManyRequestsError(
    `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`
  )
}

export const resetRateLimit = async () => {
  await getRateLimitStore().clear()
  setRateLimitStore(null)
}
