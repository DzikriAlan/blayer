import type { NextApiRequest, NextApiResponse } from 'next'
import { getErrorFields, logger } from './logger'
import { sendFailure } from './apiResponse'

type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => unknown | Promise<unknown>

const getRequestId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const SLOW_REQUEST_MS = Number(process.env.SLOW_REQUEST_MS ?? 1_000)

export const withApi = (name: string, handler: ApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const requestId = getRequestId()
    const startedAt = Date.now()
    res.setHeader('X-Request-Id', requestId)

    const getTraceFields = () => ({
      requestId,
      route: name,
      method: req.method,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    })

    try {
      await handler(req, res)

      const trace = getTraceFields()

      if (trace.durationMs >= SLOW_REQUEST_MS) {
        logger.warn('api handler lambat', {
          ...trace,
          thresholdMs: SLOW_REQUEST_MS,
        })
      } else {
        logger.info('api handler selesai', trace)
      }
    } catch (error) {
      logger.error('api handler gagal', {
        ...getTraceFields(),
        ...getErrorFields(error),
      })

      if (res.headersSent) return

      sendFailure(res, {
        status: 500,
        message: `Terjadi kesalahan di server. Sebutkan kode ${requestId} saat melapor.`,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            field: '',
            message: 'Kegagalan tak terduga di server.',
          },
        ],
      })
    }
  }
}
