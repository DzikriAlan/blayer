import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { apiKeyInputSchema, parseInput } from '@/shared/lib/agentInput'
import { createApiKeyToken } from '@/shared/lib/agentCrypto'
import { getQueryId } from '@/shared/lib/apiQuery'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return

  const projectId = getQueryId(req.query.projectId)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
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

  if (req.method === 'GET') {
    const apiKeys = await prisma.projectApiKey.findMany({
      where: { projectId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    })

    return sendSuccess(res, {
      message: 'Daftar API key berhasil dimuat',
      data: apiKeys.map((apiKey) => ({
        id: apiKey.id,
        name: apiKey.name,
        environment: apiKey.environment,
        prefix: apiKey.prefix,
        lastUsedAt: apiKey.lastUsedAt?.toISOString() ?? '',
        isRevoked: !!apiKey.revokedAt,
        createdAt: apiKey.createdAt.toISOString(),
      })),
    })
  }

  if (req.method === 'POST') {
    const { data, errors } = parseInput(apiKeyInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    const created = createApiKeyToken()

    const apiKey = await prisma.projectApiKey.create({
      data: {
        projectId,
        name: data.name,
        environment: data.environment,
        prefix: created.prefix,
        hash: created.hash,
      },
      select: { id: true, name: true, environment: true, prefix: true },
    })

    // Token utuh hanya dikirim sekali di sini; setelah ini yang tersisa di
    // basis data cuma hash-nya.
    return sendSuccess(res, {
      status: 201,
      message: 'API key berhasil dibuat. Salin sekarang — token ini tidak bisa dilihat lagi.',
      data: { ...apiKey, token: created.token },
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'POST'])
}

export default withApi('projects-keys', handler)
