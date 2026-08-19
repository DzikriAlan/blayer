import type { NextApiRequest, NextApiResponse } from 'next'
import {
  SUPABASE_BANNER_BUCKET,
  getSupabaseSetupMessage,
  isSupabaseReady,
  supabase,
} from '@/shared/lib/supabase'
import { getAuthGuard } from '@/shared/lib/authServer'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]

const MAX_BYTE = 4 * 1024 * 1024

// Banner dikirim sebagai base64 di body JSON supaya tidak perlu parser multipart.
export const config = {
  api: { bodyParser: { sizeLimit: '6mb' } },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  // Unggahan hanya dipakai builder, jadi tidak ada alasan menerimanya tanpa sesi.
  const user = await getAuthGuard(req, res)
  if (!user) {
    return
  }

  if (!isSupabaseReady || !supabase) {
    return res.status(503).json({ message: getSupabaseSetupMessage() })
  }

  const { fileName, contentType, fileBase64 } = req.body as {
    fileName?: string
    contentType?: string
    fileBase64?: string
  }

  if (!fileName || !contentType || !fileBase64) {
    return res
      .status(400)
      .json({ message: 'fileName, contentType, dan fileBase64 wajib diisi.' })
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return res
      .status(400)
      .json({ message: 'Format gambar harus JPG, PNG, WEBP, GIF, atau AVIF.' })
  }

  // Prefix "data:image/png;base64," ikut terkirim dari FileReader, dibuang dulu.
  const buffer = Buffer.from(fileBase64.split(',').pop() ?? '', 'base64')

  if (!buffer.length) {
    return res.status(400).json({ message: 'Berkas gambar tidak terbaca.' })
  }

  if (buffer.length > MAX_BYTE) {
    return res.status(400).json({ message: 'Ukuran banner maksimal 4 MB.' })
  }

  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg'
  const objectPath = `banner-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`

  const uploaded = await supabase.storage
    .from(SUPABASE_BANNER_BUCKET)
    .upload(objectPath, buffer, { contentType, upsert: false })

  if (uploaded.error) {
    // Supabase menolak key dengan pesan mentah yang menyesatkan ("Invalid
    // Compact JWS"), padahal artinya key-nya tidak dikenali gateway.
    const getUploadErrorMessage = () => {
      const raw = uploaded.error?.message ?? ''
      const isKeyRejected =
        raw.includes('Compact JWS') ||
        raw.includes('Invalid API key') ||
        raw.includes('Secret API key required')

      if (isKeyRejected) {
        return 'Secret key Supabase ditolak. Salin ulang Secret key (sb_secret_…) dari Settings → API Keys, pastikan tidak ada karakter yang terpotong, lalu restart dev server.'
      }

      if (raw.toLowerCase().includes('bucket not found')) {
        return `Bucket "${SUPABASE_BANNER_BUCKET}" belum ada. Buat bucket publik dengan nama itu di menu Storage.`
      }

      return raw
    }

    return res.status(502).json({ message: getUploadErrorMessage() })
  }

  const { data } = supabase.storage
    .from(SUPABASE_BANNER_BUCKET)
    .getPublicUrl(objectPath)

  return res.status(201).json({ url: data.publicUrl, path: objectPath })
}
