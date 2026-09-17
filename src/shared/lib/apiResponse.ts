import type { NextApiResponse } from 'next'

export interface ApiPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiErrorBody {
  code: string
  message: string
  details?: unknown
}

interface SendSuccessOptions {
  message?: string
  pagination?: ApiPagination
  status?: number
}

export const sendSuccess = <T>(res: NextApiResponse, data: T, options?: SendSuccessOptions) => {
  res.status(options?.status ?? 200).json({
    success: true,
    data,
    message: options?.message ?? 'Success',
    ...(options?.pagination ? { pagination: options.pagination } : {}),
  })
}

export const sendError = (
  res: NextApiResponse,
  status: number,
  code: string,
  message: string,
  details?: unknown
) => {
  res.status(status).json({
    success: false,
    error: { code, message, details: details ?? null },
  })
}
