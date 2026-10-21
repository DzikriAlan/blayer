import type { NextApiRequest, NextApiResponse } from 'next'

import { agentsModule } from '@server/features/agents/module'
import { authModule } from '@server/features/auth/module'
import { healthModule } from '@server/features/health/module'
import { integrationsModule } from '@server/features/integrations/module'
import { knowledgeModule } from '@server/features/knowledge/module'
import { modelsModule } from '@server/features/models/module'
import { projectsModule } from '@server/features/projects/module'
import { runsModule } from '@server/features/runs/module'
import { toolsModule } from '@server/features/tools/module'
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

  { path: 'v1/auth/login', handler: authModule.login },
  { path: 'v1/models', handler: modelsModule.collection },

  { path: 'v1/projects', handler: projectsModule.collection },
  { path: 'v1/projects/:projectId', handler: projectsModule.detail },
  { path: 'v1/projects/:projectId/keys', handler: projectsModule.keys },
  { path: 'v1/projects/:projectId/credentials', handler: projectsModule.credentials },
  { path: 'v1/projects/:projectId/integrations', handler: integrationsModule.byProject },
  { path: 'v1/projects/:projectId/knowledge', handler: knowledgeModule.byProject },

  { path: 'v1/agents', handler: agentsModule.collection },
  { path: 'v1/agents/preview', handler: agentsModule.preview },
  { path: 'v1/agents/:agentId', handler: agentsModule.detail },
  { path: 'v1/agents/:agentId/versions', handler: agentsModule.versions },
  { path: 'v1/agents/:agentId/publish', handler: agentsModule.publish },
  { path: 'v1/agents/:agentId/run', handler: agentsModule.run },
  { path: 'v1/agents/:agentId/runs', handler: agentsModule.runs },
  { path: 'v1/agents/:agentId/sessions', handler: agentsModule.sessions },

  { path: 'v1/integrations/:integrationId', handler: integrationsModule.detail },
  { path: 'v1/integrations/:integrationId/tools', handler: integrationsModule.tools },

  { path: 'v1/tools/:toolId', handler: toolsModule.detail },
  { path: 'v1/knowledge/:documentId', handler: knowledgeModule.detail },
  { path: 'v1/runs/:runId/confirm', handler: runsModule.confirm },

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
