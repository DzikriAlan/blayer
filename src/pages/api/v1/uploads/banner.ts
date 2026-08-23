import type { NextApiRequest, NextApiResponse } from 'next'
import {
  SUPABASE_BANNER_BUCKET,
  getSupabaseSetupMessage,
  isSupabaseReady,
  supabase,
} from '@/shared/lib/supabase'
import { getAuthGuard } from '@/shared/lib/authServer'
import { withApi } from '@/shared/lib/apiHandler'
import { sendFailure, sendMethodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import { getImageExtension, getImageType } from '@/shared/lib/imageBytes'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]

const MAX_BYTE = 4 * 1024 * 1024

export const config = {
  api: { bodyParser: { sizeLimit: '6mb' } },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, req.method, ['POST'])
  }

  const user = await getAuthGuard(req, res)
  if (!user) {
    return
  }

  if (
    !(await enforceRateLimit(req, res, {
      name: 'uploads-banner',
      limit: 20,
      windowMs: 10 * 60_000,
      scope: user.id,
    }))
  ) {
    return
  }

  if (!isSupabaseReady || !supabase) {
    return sendFailure(res, {
      status: 503,
      message: getSupabaseSetupMessage(),
      errors: [{ code: 'SERVICE_UNAVAILABLE', field: '', message: getSupabaseSetupMessage() }],
    })
  }

  const { fileName, contentType, fileBase64 } = req.body as {
    fileName?: string
    contentType?: string
    fileBase64?: string
  }

  if (!fileName || !contentType || !fileBase64) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'PAYLOAD_INCOMPLETE', field: 'fileBase64', message: 'fileName, contentType, dan fileBase64 wajib diisi.' }],
    })

  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'IMAGE_TYPE_UNSUPPORTED', field: 'contentType', message: 'Format gambar harus JPG, PNG, WEBP, GIF, atau AVIF.' }],
    })
  }

  const buffer = Buffer.from(fileBase64.split(',').pop() ?? '', 'base64')

  if (!buffer.length) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'IMAGE_UNREADABLE', field: 'fileBase64', message: 'Berkas gambar tidak terbaca.' }],
    })
  }

  if (buffer.length > MAX_BYTE) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'IMAGE_TOO_LARGE', field: 'fileBase64', message: 'Ukuran banner maksimal 4 MB.' }],
    })
  }

  const detectedType = getImageType(buffer)

  if (!detectedType || !ALLOWED_TYPES.includes(detectedType)) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'IMAGE_CONTENT_INVALID', field: 'fileBase64', message: 'Isi berkas bukan gambar JPG, PNG, WEBP, GIF, atau AVIF yang bisa dibaca.' }],
    })
  }

  if (detectedType !== contentType) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'IMAGE_TYPE_MISMATCH', field: 'contentType', message: `Isi berkas terbaca sebagai ${detectedType}, tidak cocok dengan ${contentType} yang disebutkan.` }],
    })
  }

  const extension = getImageExtension(detectedType)
  const objectPath = `banner-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`

  const uploaded = await supabase.storage
    .from(SUPABASE_BANNER_BUCKET)
    .upload(objectPath, buffer, { contentType: detectedType, upsert: false })

  if (uploaded.error) {
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

    return sendFailure(res, {
      status: 502,
      message: getUploadErrorMessage(),
      errors: [{ code: 'UPLOAD_FAILED', field: '', message: getUploadErrorMessage() }],
    })
  }

  const { data } = supabase.storage
    .from(SUPABASE_BANNER_BUCKET)
    .getPublicUrl(objectPath)

  return sendSuccess(res, {
    status: 201,
    message: 'Gambar berhasil diunggah',
    data: { image: data.publicUrl, path: objectPath },
  })
}

export default withApi('uploads-banner', handler)
