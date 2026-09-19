import type { NextApiResponse } from 'next'

import type { HttpError } from './http-error'

// Bentuk response mengikuti standards/RESPONSE.md: success + data + message,
// dengan pagination hanya saat datanya berupa koleksi, dan error sebagai satu
// objek berisi code, message, dan details.
export interface ApiPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface SuccessOptions<T> {
  status?: number
  message: string
  data?: T
  pagination?: ApiPagination
}

const getMeta = (res: NextApiResponse) => ({
  requestId: String(res.getHeader('X-Request-Id') ?? ''),
  timestamp: new Date().toISOString(),
})

export const sendSuccess = <T>(
  res: NextApiResponse,
  { status = 200, message, data, pagination }: SuccessOptions<T>
) =>
  res.status(status).json({
    success: true,
    ...(data === undefined ? {} : { data }),
    ...(pagination ? { pagination } : {}),
    message,
    meta: getMeta(res),
  })

export const sendError = (res: NextApiResponse, error: HttpError) =>
  res.status(error.status).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
    meta: getMeta(res),
  })

export const getPagination = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
})
