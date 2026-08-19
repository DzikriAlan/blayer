import type { NextApiRequest, NextApiResponse } from 'next'
import { logger } from './logger'

/**
 * Pembatas laju sederhana berbasis memori proses.
 *
 * Endpoint pengiriman jawaban terbuka tanpa sesi — itu memang disengaja,
 * peserta tidak perlu punya akun. Konsekuensinya satu skrip bisa mengirim
 * ribuan jawaban palsu ke form mana pun, dan jawaban itulah yang nanti jadi
 * bahan analisis AI berbayar. Batas ini menutup jalur termurah untuk itu.
 *
 * Batasnya: hitungan disimpan di memori instance, jadi saat aplikasi berjalan
 * di banyak instance serverless tiap instance punya jatahnya sendiri. Untuk
 * menahan banjir dari satu sumber ini sudah cukup; kalau nanti trafiknya besar,
 * ganti isi `getHits` dengan Redis/Upstash tanpa mengubah pemanggilnya.
 */

interface RateLimitOptions {
  /** Nama aturan, ikut jadi bagian kunci supaya antar-endpoint tidak saling makan jatah. */
  name: string
  /** Jumlah request yang boleh lewat dalam satu jendela waktu. */
  limit: number
  /** Panjang jendela waktu dalam milidetik. */
  windowMs: number
  /** Pembeda tambahan, mis. id form, supaya batas berlaku per form per IP. */
  scope?: string
}

const hits = new Map<string, number[]>()

/** Jaga-jaga kalau ada banyak IP unik: buang kunci mati sebelum menambah baru. */
const MAX_KEY = 10_000

export const getClientIp = (req: NextApiRequest) => {
  const forwarded = req.headers['x-forwarded-for']
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded

  // Header ini berisi rantai "klien, proxy1, proxy2" — yang paling depan
  // adalah alamat asli menurut proxy terdepan (Vercel/Cloudflare).
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

/**
 * Mengembalikan true kalau request boleh diteruskan. Kalau kuotanya habis,
 * fungsi ini sendiri yang membalas 429 sehingga pemanggil cukup `return`.
 */
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

/** Hanya dipakai test supaya hitungan satu kasus tidak bocor ke kasus lain. */
export const resetRateLimit = () => hits.clear()
