import type { NextApiRequest, NextApiResponse } from 'next'
import { logger } from './logger'

interface RateLimitOptions {
  name: string
  limit: number
  windowMs: number
  scope?: string
}

const hits = new Map<string, number[]>()

const MAX_KEY = 10_000

export const getClientIp = (req: NextApiRequest) => {
  const forwarded = req.headers['x-forwarded-for']
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded

  if (raw) return raw.split(',')[0].trim()

  return req.socket?.remoteAddress ?? 'unknown'
}

const prune = (now: number, windowMs: number) => {
  Array.from(hits.keys()).forEach((key) => {
    const alive = (hits.get(key) ?? []).filter(
      (stamp) => now - stamp < windowMs
    )
    if (alive.length) hits.set(key, alive)
    else hits.delete(key)
  })
}

export const enforceRateLimit = (
  req: NextApiRequest,
  res: NextApiResponse,
  { name, limit, windowMs, scope = '' }: RateLimitOptions
) => {
  const now = Date.now()
  const ip = getClientIp(req)
  const key = `${name}:${scope}:${ip}`

  if (hits.size > MAX_KEY) prune(now, windowMs)

  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < windowMs)

  if (recent.length >= limit) {
    const retryAfter = Math.ceil((windowMs - (now - recent[0])) / 1000)

    logger.warn('rate limit tercapai', { rule: name, scope, ip, limit })

    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({
      message: `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`,
    })
    return false
  }

  recent.push(now)
  hits.set(key, recent)
  return true
}

export const resetRateLimit = () => hits.clear()
