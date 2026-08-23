import type { NextApiResponse } from 'next'

export const API_VERSION = 'v1'

export interface ApiError {
  code: string
  field: string
  message: string
}

export interface ApiPagination {
  limit: number
  next_cursor: string | null
  has_more: boolean
}

interface Meta {
  request_id: string
  timestamp: string
  version: string
  pagination?: ApiPagination
}

const getRequestId = (res: NextApiResponse) =>
  String(res.getHeader('X-Request-Id') ?? '')

const getMeta = (res: NextApiResponse, pagination?: ApiPagination): Meta => ({
  request_id: getRequestId(res),
  timestamp: new Date().toISOString(),
  version: API_VERSION,
  ...(pagination ? { pagination } : {}),
})

interface SuccessOptions {
  status?: number
  message: string
  data?: unknown
  pagination?: ApiPagination
}

export const sendSuccess = (
  res: NextApiResponse,
  { status = 200, message, data = null, pagination }: SuccessOptions
) =>
  res.status(status).json({
    success: true,
    status,
    message,
    data,
    meta: getMeta(res, pagination),
    errors: null,
  })

interface FailureOptions {
  status: number
  message: string
  errors?: ApiError[]
}

export const sendFailure = (
  res: NextApiResponse,
  { status, message, errors }: FailureOptions
) =>
  res.status(status).json({
    success: false,
    status,
    message,
    data: null,
    meta: getMeta(res),
    errors: errors ?? [{ code: 'REQUEST_FAILED', field: '', message }],
  })

export const sendMethodNotAllowed = (
  res: NextApiResponse,
  method: string | undefined,
  allowed: string[]
) => {
  res.setHeader('Allow', allowed)

  return sendFailure(res, {
    status: 405,
    message: `Method ${method} not allowed`,
    errors: [
      {
        code: 'METHOD_NOT_ALLOWED',
        field: '',
        message: `Rute ini hanya menerima ${allowed.join(', ')}.`,
      },
    ],
  })
}
