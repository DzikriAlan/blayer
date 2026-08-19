import type { NextApiRequest, NextApiResponse } from 'next'
import { getErrorFields, logger } from './logger'

/**
 * Pembungkus wajib untuk semua handler di `pages/api`.
 *
 * Handler di sini banyak memanggil Prisma tanpa try/catch. Kalau database
 * putus atau query gagal, promise-nya ditolak dan Next membalas halaman error
 * HTML — padahal pemanggilnya `fetch` yang menunggu JSON, sehingga di layar
 * pengguna errornya muncul sebagai "Unexpected token '<'". Pembungkus ini
 * memastikan kegagalan apa pun tetap keluar sebagai JSON, sekaligus tercatat
 * di log dengan requestId yang sama seperti yang diterima pemanggil.
 */

type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => unknown | Promise<unknown>

/** Id pendek untuk mencocokkan laporan pengguna dengan baris log. */
const getRequestId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const withApi = (name: string, handler: ApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const requestId = getRequestId()
    res.setHeader('X-Request-Id', requestId)

    try {
      await handler(req, res)
    } catch (error) {
      logger.error('api handler gagal', {
        requestId,
        route: name,
        method: req.method,
        ...getErrorFields(error),
      })

      // Bisa saja sebagian respons sudah terkirim sebelum error terjadi;
      // menulis status lagi akan melempar error kedua yang menutupi aslinya.
      if (res.headersSent) return

      // Pesan aslinya sengaja tidak diteruskan: isinya bisa memuat detail
      // koneksi database. Yang dibagikan hanya requestId untuk penelusuran.
      res.status(500).json({
        message: `Terjadi kesalahan di server. Sebutkan kode ${requestId} saat melapor.`,
      })
    }
  }
}
