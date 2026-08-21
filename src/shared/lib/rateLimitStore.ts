import { prisma } from './prisma'
import { logger } from './logger'

export interface RateLimitHit {
  /** Berapa permintaan yang sudah tercatat di jendela ini, termasuk yang barusan. */
  total: number
  /** Waktu permintaan tertua yang masih hidup, dipakai menghitung Retry-After. */
  oldest: number
}

export interface RateLimitStore {
  readonly name: string
  add(key: string, now: number, windowMs: number): Promise<RateLimitHit>
  remove(key: string, stamp: number): Promise<void>
  clear(): Promise<void>
}

const MAX_KEY = 10_000

/**
 * Penyimpanan dalam memori proses.
 *
 * Hanya benar kalau aplikasinya berjalan sebagai satu proses. Di platform
 * serverless setiap instance punya salinan sendiri dan isinya hilang saat cold
 * start, sehingga batasnya bisa dilewati dengan memaksa instance baru — itu
 * sebabnya penyimpanan bersama dipakai begitu kredensialnya tersedia.
 */
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

/**
 * Penyimpanan bersama lewat Upstash Redis REST.
 *
 * REST dipilih supaya tidak ada koneksi TCP yang harus dijaga hidup di
 * lingkungan serverless, dan supaya tidak ada dependensi baru: cukup fetch.
 *
 * Jendelanya sliding log memakai sorted set, bukan penghitung jendela tetap,
 * supaya batasnya tidak bisa dilipatduakan dengan menembak tepat di pergantian
 * jendela.
 */
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
      // Sengaja tidak menghapus apa pun: kunci di penyimpanan bersama dipakai
      // instance lain, dan ini hanya dipanggil oleh tes.
    },
  }
}

/**
 * Penyimpanan bersama di Postgres yang sudah dipakai aplikasi.
 *
 * Dipilih ketika tidak ada Redis: di platform serverless memori proses hilang
 * setiap cold start dan tidak dibagi antar-instance, sehingga batas yang
 * disangka aktif sebenarnya bisa dilewati dengan memaksa instance baru.
 *
 * Biayanya satu transaksi kecil per permintaan yang melewati rate limit, dan
 * itu memang harga yang dibayar untuk tidak menambah layanan baru.
 */
export const createPrismaStore = (): RateLimitStore => ({
  name: 'postgres',

  async add(key, now, windowMs) {
    const cutoff = new Date(now - windowMs)

    // Satu transaksi, supaya hitungannya sudah memuat jejak yang barusan
    // ditulis dan tidak terpengaruh permintaan lain yang berjalan bersamaan.
    const [, , total, oldest] = await prisma.$transaction([
      prisma.rateLimitHit.deleteMany({ where: { key, stamp: { lt: cutoff } } }),
      prisma.rateLimitHit.create({ data: { key, stamp: new Date(now) } }),
      prisma.rateLimitHit.count({ where: { key } }),
      prisma.rateLimitHit.aggregate({
        where: { key },
        _min: { stamp: true },
      }),
    ])

    // Kunci yang tidak pernah dikunjungi lagi tidak akan terhapus oleh jalur di
    // atas, jadi sesekali seluruh jejak lama dibersihkan. Dijalankan acak
    // supaya tidak ada satu permintaan pun yang selalu menanggung biayanya.
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

/**
 * Memilih penyimpanan.
 *
 * Urutannya disengaja. Redis dipakai kalau ada. Kalau tidak, Postgres — bukan
 * memori — karena di produksi target aplikasinya serverless, dan memori proses
 * di sana bukan sekadar kurang optimal melainkan tidak berlaku sama sekali.
 *
 * Memori hanya dipakai di luar produksi, tempat aplikasinya satu proses dan
 * tesnya tidak boleh menyentuh basis data.
 */
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
    // Hanya tercapai lewat RATE_LIMIT_STORE=memory yang disetel sengaja, dan
    // di produksi itu berarti batasnya tidak berlaku lintas instance.
    logger.warn('rate limit memakai memori proses', {
      dampak: 'batas tidak berlaku lintas instance',
    })
  }

  return store
}

export const setRateLimitStore = (next: RateLimitStore | null) => {
  store = next
}
