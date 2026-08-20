import type { NextApiRequest, NextApiResponse } from 'next'
import { logger } from './logger'
import { getRateLimitStore, setRateLimitStore } from './rateLimitStore'

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

const getForwardedChain = (req: NextApiRequest) => {
  const forwarded = req.headers['x-forwarded-for']
  const raw = Array.isArray(forwarded) ? forwarded.join(',') : forwarded

  return (raw ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

/**
 * Alamat pemanggil, dihitung dari jumlah proxy yang benar-benar ada di depan
 * aplikasi.
 *
 * `X-Forwarded-For` ditulis oleh klien dan hanya ditimpa oleh proxy, jadi
 * bagian paling kiri justru bagian yang paling mudah dipalsukan: siapa pun bisa
 * mengirim header berisi alamat karangan dan memakai kuota milik orang lain,
 * atau mendapat kuota tak terbatas dengan mengganti alamat tiap permintaan.
 *
 * Yang bisa dipercaya hanya alamat yang ditambahkan oleh proxy tepercaya,
 * yaitu entri ke-n dari kanan. Tanpa TRUST_PROXY_HOPS header ini diabaikan
 * seluruhnya dan alamat soket yang dipakai.
 */
export const getClientIp = (req: NextApiRequest) => {
  const hops = Number(process.env.TRUST_PROXY_HOPS ?? 0)
  const socketIp = req.socket?.remoteAddress ?? 'unknown'

  if (!Number.isInteger(hops) || hops <= 0) return socketIp

  const chain = getForwardedChain(req)
  if (!chain.length) return socketIp

  const index = chain.length - hops
  return chain[index] ?? chain[0]
}

/**
 * Mengembalikan true kalau request boleh diteruskan. Kalau kuotanya habis,
 * fungsi ini sendiri yang membalas 429 sehingga pemanggil cukup `return`.
 */
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
    // Penyimpanan bersama yang sedang tidak bisa dihubungi tidak boleh
    // menjatuhkan seluruh rute. Permintaan diteruskan, tetapi dicatat keras
    // supaya periode tanpa perlindungan ini terlihat.
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
    res.status(429).json({
      message: `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`,
    })
    return false
  }

  return true
}

/** Hanya dipakai test supaya hitungan satu kasus tidak bocor ke kasus lain. */
export const resetRateLimit = async () => {
  await getRateLimitStore().clear()
  setRateLimitStore(null)
}
