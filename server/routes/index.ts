import type { NextApiRequest, NextApiResponse } from 'next'

import { healthModule } from '@server/features/health/module'
import { videosModule } from '@server/features/videos/module'
import { notFoundError } from '@server/shared/http-error'
import { logger } from '@server/shared/utils/logger.util'
import { sendError } from '@server/shared/response'
import { getRequestId, type RouteHandler } from '@server/shared/route'

interface Route {
  // Segmen path tanpa /api; segmen berawalan ':' adalah parameter.
  path: string
  handler: RouteHandler
}

// Tabel rute: satu tempat yang memasang module tiap feature ke alamatnya.
// Detail HTTP tetap di controller, dan file ini tidak memuat business logic.
const routes: Route[] = [
  { path: 'health', handler: healthModule.status },

  { path: 'v1/videos', handler: videosModule.list },
  { path: 'v1/videos/search', handler: videosModule.search },
  { path: 'v1/videos/:videoId', handler: videosModule.detail },
]

const matched = routes.map((route) => ({
  ...route,
  segments: route.path.split('/'),
}))

const getMatch = (segments: string[]) => {
  for (const route of matched) {
    if (route.segments.length !== segments.length) continue

    const params: Record<string, string> = {}

    const isMatch = route.segments.every((segment, index) => {
      const value = segments[index] ?? ''

      if (!segment.startsWith(':')) return segment === value

      if (!value) return false
      params[segment.slice(1)] = value

      return true
    })

    if (isMatch) return { handler: route.handler, params }
  }

  return null
}

export const getRoutePaths = () => routes.map((route) => route.path)

// Satu pintu masuk untuk seluruh API. Parameter path disalin ke req.query
// supaya controller membacanya dengan cara yang sama seperti sebelumnya.
export const routeRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const raw = req.query.path
  const segments = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(Boolean)
  const match = getMatch(segments)

  if (!match) {
    // Alamat yang tidak terdaftar tetap mendapat request id dan jejak log,
    // sama seperti kegagalan lain.
    const requestId = getRequestId()
    res.setHeader('X-Request-Id', requestId)

    logger.warn('rute tidak terdaftar', {
      requestId,
      method: req.method,
      path: `/api/${segments.join('/')}`,
    })

    return sendError(
      res,
      notFoundError('ROUTE_NOT_FOUND', `Rute /api/${segments.join('/')} tidak ada.`)
    )
  }

  req.query = { ...req.query, ...match.params }

  return match.handler(req, res)
}
