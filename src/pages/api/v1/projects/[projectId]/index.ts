import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { getQueryId } from '@/shared/lib/apiQuery'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return
  if (req.method !== 'GET') return sendMethodNotAllowed(res, req.method, ['GET'])

  const project = await prisma.project.findUnique({
    where: { id: getQueryId(req.query.projectId) },
    include: {
      agents: {
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          productionVersionId: true,
          createdAt: true,
          _count: { select: { versions: true, runs: true } },
        },
      },
      apiKeys: {
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          name: true,
          environment: true,
          prefix: true,
          lastUsedAt: true,
          revokedAt: true,
          createdAt: true,
        },
      },
      providerKeys: {
        orderBy: [{ provider: 'asc' }, { environment: 'asc' }],
        select: {
          id: true,
          provider: true,
          environment: true,
          hint: true,
          updatedAt: true,
        },
      },
    },
  })

  if (!project) {
    return sendFailure(res, {
      status: 404,
      message: 'Project tidak ditemukan',
      errors: [
        {
          code: 'PROJECT_NOT_FOUND',
          field: 'projectId',
          message: 'Project dengan id itu tidak ada.',
        },
      ],
    })
  }

  return sendSuccess(res, {
    message: 'Project berhasil dimuat',
    data: {
      id: project.id,
      slug: project.slug,
      name: project.name,
      description: project.description ?? '',
      createdAt: project.createdAt.toISOString(),
      agents: project.agents.map((agent) => ({
        id: agent.id,
        slug: agent.slug,
        name: agent.name,
        description: agent.description ?? '',
        isPublished: !!agent.productionVersionId,
        totalVersions: agent._count.versions,
        totalRuns: agent._count.runs,
        createdAt: agent.createdAt.toISOString(),
      })),
      apiKeys: project.apiKeys.map((apiKey) => ({
        id: apiKey.id,
        name: apiKey.name,
        environment: apiKey.environment,
        prefix: apiKey.prefix,
        lastUsedAt: apiKey.lastUsedAt?.toISOString() ?? '',
        isRevoked: !!apiKey.revokedAt,
        createdAt: apiKey.createdAt.toISOString(),
      })),
      providerKeys: project.providerKeys.map((credential) => ({
        id: credential.id,
        provider: credential.provider,
        environment: credential.environment,
        hint: credential.hint,
        updatedAt: credential.updatedAt.toISOString(),
      })),
    },
  })
}

export default withApi('projects-detail', handler)
