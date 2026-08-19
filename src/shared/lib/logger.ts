/**
 * Log terstruktur untuk sisi server.
 *
 * Satu baris JSON per kejadian, bukan `console.log` bebas: penyedia hosting
 * (Vercel, Railway, CloudWatch) mem-parse baris JSON menjadi field yang bisa
 * dicari dan dijadikan alert. Tanpa ini, kegagalan di produksi hanya terlihat
 * kalau ada pengguna yang melapor.
 */

type LogLevel = 'info' | 'warn' | 'error'

interface LogFields {
  [key: string]: unknown
}

const write = (level: LogLevel, message: string, fields: LogFields = {}) => {
  const entry = JSON.stringify({
    level,
    message,
    // Waktu diambil saat penulisan supaya urutan log tetap benar walau
    // request-nya berjalan lama.
    time: new Date().toISOString(),
    ...fields,
  })

  if (level === 'error') return console.error(entry)
  if (level === 'warn') return console.warn(entry)
  return console.log(entry)
}

export const logger = {
  info: (message: string, fields?: LogFields) => write('info', message, fields),
  warn: (message: string, fields?: LogFields) => write('warn', message, fields),
  error: (message: string, fields?: LogFields) =>
    write('error', message, fields),
}

/**
 * Merangkum Error menjadi field yang aman ditulis ke log.
 *
 * Stack hanya ikut di luar produksi — di produksi stack bisa memuat path
 * internal dan potongan query yang tidak perlu tersebar ke agregator log.
 */
export const getErrorFields = (error: unknown) => ({
  errorName: error instanceof Error ? error.name : 'UnknownError',
  errorMessage: error instanceof Error ? error.message : String(error),
  ...(process.env.NODE_ENV === 'production'
    ? {}
    : { stack: error instanceof Error ? error.stack : undefined }),
})
