type LogLevel = 'info' | 'warn' | 'error'

interface LogFields {
  [key: string]: unknown
}

const write = (level: LogLevel, message: string, fields: LogFields = {}) => {
  const entry = JSON.stringify({
    level,
    message,
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

export const getErrorFields = (error: unknown) => ({
  errorName: error instanceof Error ? error.name : 'UnknownError',
  errorMessage: error instanceof Error ? error.message : String(error),
  ...(process.env.NODE_ENV === 'production'
    ? {}
    : { stack: error instanceof Error ? error.stack : undefined }),
})
