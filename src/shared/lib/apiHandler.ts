import type { NextApiRequest, NextApiResponse } from 'next'
import { getErrorFields, logger } from './logger'
import { sendFailure } from './apiResponse'

type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => unknown | Promise<unknown>

const getRequestId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const withApi = (name: string, handler: ApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const requestId = getRequestId()
    res.setHeader('X-Request-Id', requestId)

    try {
      await handler(req, res)
    } catch (error) {
      logger.error('api handler gagal', {
        requestId,
        route: name,
        method: req.method,
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
