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

/**
 * Field yang tidak ikut dikirim ke layanan alert.
 *
 * Log tetap memuatnya karena tinggal di infrastruktur sendiri, sedangkan
 * webhook mengirimkannya ke pihak ketiga — biasanya kanal chat yang dibaca
 * banyak orang dan disimpan tanpa masa kedaluwarsa.
 */
const REDACTED = new Set([
  'ip',
  'email',
  'respondentEmail',
  'respondentName',
  'token',
  'authorization',
  'password',
  'stack',
])

const getSafeFields = (fields: LogFields) =>
  Object.fromEntries(
    Object.entries(fields).map(([key, value]) =>
      REDACTED.has(key) ? [key, '[disaring]'] : [key, value]
    )
  )

const ALERT_SILENCE_MS = 5 * 60_000
const lastAlert = new Map<string, number>()

/**
 * Menahan alert yang berulang.
 *
 * Satu kegagalan di produksi jarang datang sendirian: basis data yang tumbang
 * memicu satu error per request. Tanpa jeda ini, kanal alert dibanjiri ribuan
 * pesan untuk satu insiden dan justru jadi tidak terbaca.
 */
const isSilenced = (message: string, now: number) => {
  const previous = lastAlert.get(message)
  if (previous && now - previous < ALERT_SILENCE_MS) return true

  if (lastAlert.size > 500) lastAlert.clear()
  lastAlert.set(message, now)
  return false
}

const sendAlertWebhook = (message: string, fields: LogFields) => {
  const webhookUrl = (process.env.ALERT_WEBHOOK_URL ?? '').trim()
  if (!webhookUrl) return

  if (isSilenced(message, Date.now())) return

  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `BLAYER ALERT: ${message}\n\`\`\`json\n${JSON.stringify(
        getSafeFields(fields),
        null,
        2
      )}\n\`\`\``,
    }),
    // Alert tidak boleh menggantung request yang sedang dilayani.
    signal: AbortSignal.timeout(3_000),
  }).catch((error) => {
    // Sengaja `warn`, bukan `error`: memakai `error` di sini akan memanggil
    // pengirim alert ini lagi dan berputar tanpa henti.
    write('warn', 'alert webhook gagal terkirim', {
      errorMessage: error instanceof Error ? error.message : String(error),
    })
  })
}

export const logger = {
  info: (message: string, fields?: LogFields) => write('info', message, fields),
  warn: (message: string, fields?: LogFields) => write('warn', message, fields),
  error: (message: string, fields?: LogFields) => {
    write('error', message, fields)
    sendAlertWebhook(message, fields ?? {})
  },
}

export const resetAlertSilence = () => lastAlert.clear()

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
