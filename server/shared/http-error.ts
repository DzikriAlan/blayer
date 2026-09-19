import { Prisma } from '@prisma/client'

export interface HttpErrorDetails {
  [field: string]: string[]
}

// Satu bentuk error untuk seluruh backend. Repository, service, dan controller
// melemparkan ini; hanya route boundary yang menerjemahkannya ke HTTP.
export class HttpError extends Error {
  readonly status: number
  readonly code: string
  readonly details: HttpErrorDetails | null

  constructor(
    status: number,
    code: string,
    message: string,
    details: HttpErrorDetails | null = null
  ) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const badRequestError = (
  message: string,
  code = 'BAD_REQUEST',
  details: HttpErrorDetails | null = null
) => new HttpError(400, code, message, details)

export const validationError = (details: HttpErrorDetails) =>
  new HttpError(422, 'VALIDATION_ERROR', 'Data yang dikirim tidak valid.', details)

export const unauthorizedError = (message: string) =>
  new HttpError(401, 'UNAUTHORIZED', message)

export const forbiddenError = (code: string, message: string) =>
  new HttpError(403, code, message)

export const notFoundError = (code: string, message: string) =>
  new HttpError(404, code, message)

export const conflictError = (code: string, message: string) =>
  new HttpError(409, code, message)

export const unprocessableError = (code: string, message: string) =>
  new HttpError(422, code, message)

export const tooManyRequestsError = (message: string) =>
  new HttpError(429, 'RATE_LIMITED', message)

export const serviceUnavailableError = (code: string, message: string) =>
  new HttpError(503, code, message)

export const internalError = (message = 'Terjadi kesalahan di server.') =>
  new HttpError(500, 'INTERNAL_SERVER_ERROR', message)

// Basis data yang tidak bisa dihubungi bukan kesalahan pemanggil dan bukan bug
// aplikasi; menyamarkannya sebagai 500 membuat operator menebak-nebak. Kode
// koneksi Prisma dipetakan ke 503 dengan sebab yang jelas.
const CONNECTION_CODES = new Set(['P1000', 'P1001', 'P1002', 'P1008', 'P1010', 'P1017'])

const DATABASE_UNAVAILABLE_MESSAGE =
  'Basis data tidak bisa dihubungi. Periksa DATABASE_URL dan pastikan basis datanya hidup.'

// Prisma error diterjemahkan di repository supaya pesan mentahnya tidak pernah
// sampai ke pemanggil.
export const handlePrismaError = (error: unknown, resource: string) => {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return serviceUnavailableError(
      'DATABASE_UNAVAILABLE',
      DATABASE_UNAVAILABLE_MESSAGE
    )
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (CONNECTION_CODES.has(error.code)) {
      return serviceUnavailableError(
        'DATABASE_UNAVAILABLE',
        DATABASE_UNAVAILABLE_MESSAGE
      )
    }

    if (error.code === 'P2025') {
      return notFoundError(
        `${resource.toUpperCase()}_NOT_FOUND`,
        `${resource} tidak ditemukan.`
      )
    }

    if (error.code === 'P2002') {
      return conflictError(
        `${resource.toUpperCase()}_CONFLICT`,
        `${resource} dengan nilai unik yang sama sudah ada.`
      )
    }
  }

  return internalError(`Gagal mengakses data ${resource}.`)
}

export const normalizeHttpError = (error: unknown) =>
  error instanceof HttpError ? error : internalError()
