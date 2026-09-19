import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { agentUpdateInputSchema, parseInput } from '@/shared/lib/agentInput'
import { getQueryId } from '@/shared/lib/apiQuery'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const sendAgentNotFound = (res: NextApiResponse) =>
  sendFailure(res, {
    status: 404,
    message: 'Agent tidak ditemukan',
    errors: [
      {
        code: 'AGENT_NOT_FOUND',
        field: 'agentId',
        message: 'Agent dengan id itu tidak ada.',
      },
    ],
  })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return

  const agentId = getQueryId(req.query.agentId)

  if (req.method === 'GET') {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        project: { select: { id: true, slug: true, name: true } },
        versions: {
          orderBy: { version: 'desc' },
          select: {
            id: true,
            version: true,
            status: true,
            instructions: true,
            provider: true,
            model: true,
            effort: true,
            maxTokens: true,
            temperature: true,
            publishedAt: true,
            createdAt: true,
          },
        },
      },
    })

    if (!agent) return sendAgentNotFound(res)

    return sendSuccess(res, {
      message: 'Agent berhasil dimuat',
      data: {
        id: agent.id,
        slug: agent.slug,
        name: agent.name,
        description: agent.description ?? '',
        projectId: agent.projectId,
        projectName: agent.project.name,
        productionVersionId: agent.productionVersionId ?? '',
        createdAt: agent.createdAt.toISOString(),
        versions: agent.versions.map((version) => ({
          id: version.id,
          version: version.version,
          status: version.status,
          instructions: version.instructions,
          provider: version.provider,
          model: version.model,
          effort: version.effort,
          maxTokens: version.maxTokens,
          temperature: version.temperature,
          isProduction: version.id === agent.productionVersionId,
          publishedAt: version.publishedAt?.toISOString() ?? '',
          createdAt: version.createdAt.toISOString(),
        })),
      },
    })
  }

  if (req.method === 'PUT') {
    const { data, errors } = parseInput(agentUpdateInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { id: true, projectId: true, slug: true },
    })

    if (!agent) return sendAgentNotFound(res)

    if (agent.slug !== data.slug) {
      const taken = await prisma.agent.findUnique({
        where: { projectId_slug: { projectId: agent.projectId, slug: data.slug } },
        select: { id: true },
      })

      if (taken) {
        return sendFailure(res, {
          status: 409,
          message: 'Slug agent sudah dipakai',
          errors: [
            {
              code: 'SLUG_TAKEN',
              field: 'slug',
              message: `Slug ${data.slug} sudah dipakai agent lain di project ini.`,
            },
          ],
        })
      }
    }

    const updated = await prisma.agent.update({
      where: { id: agentId },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
      },
      select: { id: true, slug: true, name: true },
    })

    return sendSuccess(res, {
      message: 'Agent berhasil diperbarui',
      data: updated,
    })
  }

  if (req.method === 'DELETE') {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { id: true },
    })

    if (!agent) return sendAgentNotFound(res)

    // Tautan ke versi production dilepas lebih dulu; tanpa itu penghapusan
    // agent tertahan oleh kunci asing yang menunjuk versinya sendiri.
    await prisma.agent.update({
      where: { id: agentId },
      data: { productionVersionId: null },
    })
    await prisma.agent.delete({ where: { id: agentId } })

    return sendSuccess(res, {
      message: 'Agent berhasil dihapus',
      data: { id: agentId },
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'PUT', 'DELETE'])
}

export default withApi('agents-detail', handler)
