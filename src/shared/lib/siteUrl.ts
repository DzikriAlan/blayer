import type { NextApiRequest } from 'next'

/**
 * Alamat dasar untuk tautan yang dikirim lewat surat.
 *
 * Header `Host` ditentukan oleh pemanggil, bukan oleh server. Kalau tautan
 * pemulihan dibangun darinya, penyerang cukup meminta pemulihan untuk username
 * korban sambil mengirim `Host: situs-jahat.test`: korban menerima surat yang
 * sah dari sistem ini, dengan tautan yang menunjuk ke penyerang, dan token
 * pemulihannya ikut terbawa ke sana.
 *
 * Karena itu di produksi hanya `NEXT_PUBLIC_SITE_URL` yang dipercaya. Kalau
 * belum diisi, fungsi ini mengembalikan string kosong dan pemanggil wajib
 * membatalkan pengiriman — lebih baik surat tidak terkirim daripada terkirim
 * menuju domain yang salah.
 */
export const getSiteUrl = (req: NextApiRequest) => {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim()
  if (configured) return configured.replace(/\/+$/, '')

  if (process.env.NODE_ENV === 'production') return ''

  // Di luar produksi host-nya localhost dan tidak ada surat sungguhan yang
  // dipertaruhkan, jadi menurunkannya dari permintaan justru memudahkan.
  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'http'
  return `${proto}://${req.headers.host}`
}
