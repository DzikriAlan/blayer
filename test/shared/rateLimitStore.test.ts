import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createMemoryStore,
  createUpstashStore,
  getRateLimitStore,
  setRateLimitStore,
} from '@/server/shared/services/rateLimitStore.service'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  setRateLimitStore(null)
  delete process.env.UPSTASH_REDIS_REST_URL
  delete process.env.UPSTASH_REDIS_REST_TOKEN
})

describe('penyimpanan rate limit', () => {
  it('TC-43a memilih penyimpanan bersama begitu kredensialnya terbaca', () => {
    expect(getRateLimitStore().name).toBe('memory')

    setRateLimitStore(null)
    process.env.UPSTASH_REDIS_REST_URL = 'https://contoh.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token-rahasia'

    expect(getRateLimitStore().name).toBe('upstash')
  })

  it('TC-43c tanpa Redis, produksi jatuh ke Postgres — bukan ke memori', () => {
    vi.stubEnv('NODE_ENV', 'production')

    setRateLimitStore(null)
    expect(getRateLimitStore().name).toBe('postgres')

    vi.unstubAllEnvs()
  })

  it('TC-43c Redis tetap menang kalau memang dikonfigurasi', () => {
    vi.stubEnv('NODE_ENV', 'production')
    process.env.UPSTASH_REDIS_REST_URL = 'https://contoh.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token-rahasia'

    setRateLimitStore(null)
    expect(getRateLimitStore().name).toBe('upstash')

    vi.unstubAllEnvs()
  })

  it('TC-43a hitungan dalam memori membuang jejak di luar jendela', async () => {
    const store = createMemoryStore()
    const now = 1_000_000

    await store.add('kunci', now, 60_000)
    await store.add('kunci', now + 1_000, 60_000)

    const inside = await store.add('kunci', now + 2_000, 60_000)
    expect(inside.total).toBe(3)
    expect(inside.oldest).toBe(now)

    const outside = await store.add('kunci', now + 120_000, 60_000)
    expect(outside.total).toBe(1)
  })
})

describe('penyimpanan bersama lewat Upstash', () => {
  let sent: unknown[][] = []

  beforeEach(() => {
    sent = []
    globalThis.fetch = vi.fn(async (_url, init) => {
      sent = JSON.parse(String((init as RequestInit).body))
      return {
        ok: true,
        json: async () => [
          { result: 0 },
          { result: 1 },
          { result: 1 },
          { result: 3 },
          { result: ['1000000', '1000000'] },
        ],
      } as Response
    }) as typeof fetch
  })

  it('TC-43b memakai sliding window, bukan penghitung jendela tetap', async () => {
    const store = createUpstashStore({
      url: 'https://contoh.upstash.io',
      token: 'token-rahasia',
    })

    const hit = await store.add('kunci', 1_000_500, 60_000)

    const commands = sent.map((item) => String((item as string[])[0]))
    expect(commands).toContain('ZREMRANGEBYSCORE')
    expect(commands).toContain('ZADD')
    expect(commands).toContain('ZCARD')

    expect(hit.total).toBe(3)
    expect(hit.oldest).toBe(1_000_000)
  })

  it('TC-43b kunci diberi masa hidup supaya tidak menumpuk selamanya', async () => {
    const store = createUpstashStore({
      url: 'https://contoh.upstash.io',
      token: 'token-rahasia',
    })

    await store.add('kunci', 1_000_500, 60_000)

    const expire = sent.find((item) => (item as string[])[0] === 'PEXPIRE')
    expect(expire).toEqual(['PEXPIRE', 'kunci', 60_000])
  })

  it('TC-43b jawaban gagal dari penyimpanan dilaporkan, bukan didiamkan', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })) as unknown as typeof fetch

    const store = createUpstashStore({
      url: 'https://contoh.upstash.io',
      token: 'token-rahasia',
    })

    await expect(store.add('kunci', 1, 60_000)).rejects.toThrow(/500/)
  })
})
