type LogLevel = 'info' | 'warn' | 'error'

interface LogFields {
  [key: string]: unknown
}

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

const write = (level: LogLevel, message: string, fields: LogFields = {}) => {
  const entry = JSON.stringify({
    level,
    message,
    time: new Date().toISOString(),
    ...getSafeFields(fields),
  })

  if (level === 'error') return console.error(entry)
  if (level === 'warn') return console.warn(entry)
  return console.log(entry)
}

const ALERT_SILENCE_MS = 5 * 60_000
const lastAlert = new Map<string, number>()

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
    signal: AbortSignal.timeout(3_000),
  }).catch((error) => {
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

export const getErrorFields = (error: unknown) => ({
  errorName: error instanceof Error ? error.name : 'UnknownError',
  errorMessage: error instanceof Error ? error.message : String(error),
  ...(process.env.NODE_ENV === 'production'
    ? {}
    : { stack: error instanceof Error ? error.stack : undefined }),
})
