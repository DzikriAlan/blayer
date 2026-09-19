import type { NextApiRequest, NextApiResponse } from 'next'
import type { ZodTypeAny, z } from 'zod'

import { getErrorFields, logger } from '@/shared/lib/logger'
import {
  HttpError,
  normalizeHttpError,
  validationError,
  type HttpErrorDetails,
} from './http-error'
import { sendError } from './response'

export type RouteHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<unknown> | unknown

export type RouteMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export const SLOW_REQUEST_MS = Number(process.env.SLOW_REQUEST_MS ?? 1_000)

const getRequestId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

// Pengganti error middleware Express: satu pintu terakhir yang menerjemahkan
// error apa pun menjadi response error standar, dan satu tempat pencatatan
// jejak permintaan.
export const createRoute = (
  name: string,
  handlers: Partial<Record<RouteMethod, RouteHandler>>
) => {
  const allowed = Object.keys(handlers) as RouteMethod[]

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const requestId = getRequestId()
    const startedAt = Date.now()
    res.setHeader('X-Request-Id', requestId)

    const getTrace = () => ({
      requestId,
      route: name,
      method: req.method,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    })

    try {
      const handler = handlers[(req.method ?? 'GET') as RouteMethod]

      if (!handler) {
        res.setHeader('Allow', allowed)

        throw new HttpError(
          405,
          'METHOD_NOT_ALLOWED',
          `Rute ini hanya menerima ${allowed.join(', ')}.`
        )
      }

      await handler(req, res)

      const trace = getTrace()

      if (trace.durationMs >= SLOW_REQUEST_MS) {
        logger.warn('rute lambat', { ...trace, thresholdMs: SLOW_REQUEST_MS })
      } else {
        logger.info('rute selesai', trace)
      }
    } catch (error) {
      const httpError = normalizeHttpError(error)

      if (httpError.status >= 500) {
        logger.error('rute gagal', { ...getTrace(), ...getErrorFields(error) })
      } else {
        logger.warn('rute menolak permintaan', {
          ...getTrace(),
          code: httpError.code,
        })
      }

      if (res.headersSent) return

      // Hanya kegagalan tak terduga yang pesannya disamarkan; 503 seperti
      // basis data mati atau konfigurasi kurang justru harus terbaca jelas.
      sendError(
        res,
        httpError.status === 500
          ? new HttpError(
              httpError.status,
              httpError.code,
              `Terjadi kesalahan di server. Sebutkan kode ${requestId} saat melapor.`
            )
          : httpError
      )
    }
  }
}

// Validasi dijalankan sebelum service dipanggil, dan kegagalannya selalu
// berbentuk daftar pesan per field sesuai standards/RESPONSE.md.
export const parseDto = <S extends ZodTypeAny>(
  schema: S,
  input: unknown
): z.infer<S> => {
  const result = schema.safeParse(input ?? {})

  if (result.success) return result.data

  const details: HttpErrorDetails = {}

  result.error.issues.forEach((issue) => {
    const field = issue.path.join('.') || 'body'

    // Field yang sama sekali tidak dikirim dilaporkan Zod sebagai "Required";
    // pesannya diterjemahkan supaya seluruh jawabannya berbahasa sama.
    const message =
      issue.code === 'invalid_type' && issue.received === 'undefined'
        ? `${field} wajib diisi.`
        : issue.message

    details[field] = [...(details[field] ?? []), message]
  })

  throw validationError(details)
}

export const getQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] ?? '') : (value ?? '')

export const getQueryNumber = (
  value: string | string[] | undefined,
  fallback: number,
  { min = 1, max = 100 }: { min?: number; max?: number } = {}
) => {
  const parsed = Number(getQueryValue(value))

  return Number.isFinite(parsed)
    ? Math.min(Math.max(Math.trunc(parsed), min), max)
    : fallback
}
