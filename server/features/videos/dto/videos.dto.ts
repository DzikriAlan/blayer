import { z } from 'zod'

export const VIDEOS_MAX_QUERIES = 6
export const VIDEOS_MAX_PAGE = 5
export const VIDEOS_MAX_LIMIT = 100
export const VIDEOS_MAX_AGE_HOURS = 168

// Query string selalu berupa teks; angka diubah dulu sebelum divalidasi
const numberQuery = (fallback: number, field: string, max: number, min = 0) =>
  z.preprocess(
    (value) => (value === undefined || value === '' ? fallback : Number(value)),
    z
      .number({ invalid_type_error: `${field} harus berupa angka.` })
      .int(`${field} harus bilangan bulat.`)
      .min(min, `${field} minimal ${min}.`)
      .max(max, `${field} maksimal ${max}.`)
  )

// Parameter q boleh berulang (?q=IHSG&q=saham) dan hasilnya digabung
export const searchVideosValidation = z.object({
  q: z.preprocess(
    (value) =>
      (Array.isArray(value) ? value : value === undefined ? [] : [value])
        .map((item) => String(item).trim())
        .filter(Boolean),
    z
      .array(z.string())
      .min(1, 'Parameter q wajib diisi, contoh ?q=ekonomi indonesia.')
      .max(VIDEOS_MAX_QUERIES, `Maksimal ${VIDEOS_MAX_QUERIES} parameter q dalam satu permintaan.`)
  ),
  period: z
    .enum(['hour', 'today', 'week', 'month', 'year', 'all'], {
      errorMap: () => ({ message: 'Pilih salah satu: hour, today, week, month, year, all.' }),
    })
    .default('week'),
  sort: z
    .enum(['date', 'relevance', 'views'], {
      errorMap: () => ({ message: 'Pilih salah satu: date, relevance, views.' }),
    })
    .default('date'),
  page: numberQuery(1, 'page', VIDEOS_MAX_PAGE, 1),
  limit: numberQuery(20, 'limit', VIDEOS_MAX_LIMIT, 1),
  // 0 berarti tanpa batas umur
  maxAgeHours: numberQuery(0, 'maxAgeHours', VIDEOS_MAX_AGE_HOURS),
  shortsPercent: numberQuery(0, 'shortsPercent', 100),
})

export const videoIdValidation = z.object({
  videoId: z
    .string()
    .regex(/^[\w-]{11}$/, 'ID video YouTube terdiri dari 11 karakter.'),
})

// `since` = syncedAt terakhir yang dimiliki browser; kosong berarti ambil semuanya
export const listVideosValidation = z.object({
  since: z.preprocess(
    (value) => (value === undefined || value === '' ? undefined : value),
    z.coerce
      .date({ errorMap: () => ({ message: 'since harus berupa tanggal ISO, contoh 2026-10-21T03:00:00.000Z.' }) })
      .optional()
  ),
})

export type ListVideosDto = z.infer<typeof listVideosValidation>
export type SearchVideosDto = z.infer<typeof searchVideosValidation>
