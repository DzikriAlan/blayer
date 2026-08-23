import { prisma } from './prisma'
import { logger } from './logger'

export interface RateLimitHit {
  total: number
  oldest: number
}

export interface RateLimitStore {
  readonly name: string
  add(key: string, now: number, windowMs: number): Promise<RateLimitHit>
  remove(key: string, stamp: number): Promise<void>
  clear(): Promise<void>
}

const MAX_KEY = 10_000

export const createMemoryStore = (): RateLimitStore => {
  const hits = new Map<string, number[]>()

  const prune = (now: number, windowMs: number) => {
    Array.from(hits.keys()).forEach((key) => {
      const alive = (hits.get(key) ?? []).filter(
        (stamp) => now - stamp < windowMs
      )
      if (alive.length) hits.set(key, alive)
      else hits.delete(key)
    })
  }

  return {
    name: 'memory',

    async add(key, now, windowMs) {
      if (hits.size > MAX_KEY) prune(now, windowMs)

      const alive = (hits.get(key) ?? []).filter(
        (stamp) => now - stamp < windowMs
      )

      alive.push(now)
      hits.set(key, alive)

      return { total: alive.length, oldest: alive[0] }
    },

    async remove(key, stamp) {
      const alive = (hits.get(key) ?? []).filter((item) => item !== stamp)
      if (alive.length) hits.set(key, alive)
      else hits.delete(key)
    },

    async clear() {
      hits.clear()
    },
  }
}

interface UpstashConfig {
  url: string
  token: string
}

export const createUpstashStore = ({
  url,
  token,
}: UpstashConfig): RateLimitStore => {
  const call = async (commands: (string | number)[][]) => {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
    })

    if (!res.ok) {
      throw new Error(`Upstash menjawab ${res.status} ${res.statusText}`)
    }

    return (await res.json()) as { result: unknown; error?: string }[]
  }

  return {
    name: 'upstash',

    async add(key, now, windowMs) {
      const results = await call([
        ['ZREMRANGEBYSCORE', key, 0, now - windowMs],
        ['ZADD', key, now, `${now}`],
        ['PEXPIRE', key, windowMs],
        ['ZCARD', key],
        ['ZRANGE', key, 0, 0, 'WITHSCORES'],
      ])

      const failed = results.find((item) => item.error)
      if (failed) throw new Error(String(failed.error))

      const total = Number(results[3]?.result ?? 0)
      const range = results[4]?.result as string[] | undefined
      const oldest = Number(range?.[1] ?? now)

      return { total, oldest: Number.isFinite(oldest) ? oldest : now }
    },

    async remove(key, stamp) {
      await call([['ZREM', key, `${stamp}`]])
    },

    async clear() {
    },
  }
}

export const createPrismaStore = (): RateLimitStore => ({
  name: 'postgres',

  async add(key, now, windowMs) {
    const cutoff = new Date(now - windowMs)

    const [, , total, oldest] = await prisma.$transaction([
      prisma.rateLimitHit.deleteMany({ where: { key, stamp: { lt: cutoff } } }),
      prisma.rateLimitHit.create({ data: { key, stamp: new Date(now) } }),
      prisma.rateLimitHit.count({ where: { key } }),
      prisma.rateLimitHit.aggregate({
        where: { key },
        _min: { stamp: true },
      }),
    ])

    if (Math.random() < 0.01) {
      const stale = new Date(now - 24 * 60 * 60_000)
      await prisma.rateLimitHit
        .deleteMany({ where: { stamp: { lt: stale } } })
        .catch(() => undefined)
    }

    return {
      total,
      oldest: oldest._min.stamp ? oldest._min.stamp.getTime() : now,
    }
  },

  async remove(key, stamp) {
    await prisma.rateLimitHit.deleteMany({
      where: { key, stamp: new Date(stamp) },
    })
  },

  async clear() {
    await prisma.rateLimitHit.deleteMany({})
  },
})

const readConfig = (): UpstashConfig | null => {
  const url = (
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.RATE_LIMIT_REDIS_REST_URL ||
    ''
  ).trim()

  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.RATE_LIMIT_REDIS_REST_TOKEN ||
    ''
  ).trim()

  if (!url || !token) return null

  return { url: url.replace(/\/+$/, ''), token }
}

let store: RateLimitStore | null = null

export const getRateLimitStore = () => {
  if (store) return store

  const mode = (process.env.RATE_LIMIT_STORE ?? '').trim().toLowerCase()
  const config = readConfig()

  if (mode === 'memory') store = createMemoryStore()
  else if (mode === 'postgres') store = createPrismaStore()
  else if (config) store = createUpstashStore(config)
  else if (process.env.NODE_ENV === 'production') store = createPrismaStore()
  else store = createMemoryStore()

  if (store.name === 'memory' && process.env.NODE_ENV === 'production') {
    logger.warn('rate limit memakai memori proses', {
      dampak: 'batas tidak berlaku lintas instance',
    })
  }

  return store
}

export const setRateLimitStore = (next: RateLimitStore | null) => {
  store = next
}
