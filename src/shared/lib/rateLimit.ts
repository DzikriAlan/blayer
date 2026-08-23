import type { NextApiRequest, NextApiResponse } from 'next'
import { logger } from './logger'
import { getRateLimitStore, setRateLimitStore } from './rateLimitStore'
import { sendFailure } from './apiResponse'

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

export const enforceRateLimit = async (
  req: NextApiRequest,
  res: NextApiResponse,
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
    return true
  }

  if (hit.total > limit) {
    await store.remove(key, now).catch(() => {})

    const retryAfter = Math.max(
      1,
      Math.ceil((windowMs - (now - hit.oldest)) / 1000)
    )

    logger.warn('rate limit tercapai', { rule: name, scope, ip, limit })

    res.setHeader('Retry-After', String(retryAfter))
    sendFailure(res, {
      status: 429,
      message: `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`,
      errors: [
        {
          code: 'RATE_LIMITED',
          field: '',
          message: `Coba lagi dalam ${retryAfter} detik.`,
        },
      ],
    })
    return false
  }

  return true
}

export const resetRateLimit = async () => {
  await getRateLimitStore().clear()
  setRateLimitStore(null)
}
