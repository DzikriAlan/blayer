import type { NextApiRequest, NextApiResponse } from 'next'
import { AgentVersionStatus } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { agentInputSchema, parseInput } from '@/shared/lib/agentInput'
import { getQueryId } from '@/shared/lib/apiQuery'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return

  if (req.method === 'GET') {
    const projectId = getQueryId(req.query.projectId)

    const agents = await prisma.agent.findMany({
      where: projectId ? { projectId } : {},
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        project: { select: { id: true, slug: true, name: true } },
        _count: { select: { versions: true, runs: true } },
      },
    })

    return sendSuccess(res, {
      message: 'Daftar agent berhasil dimuat',
      data: agents.map((agent) => ({
        id: agent.id,
        slug: agent.slug,
        name: agent.name,
        description: agent.description ?? '',
        projectId: agent.projectId,
        projectName: agent.project.name,
        isPublished: !!agent.productionVersionId,
        totalVersions: agent._count.versions,
        totalRuns: agent._count.runs,
        createdAt: agent.createdAt.toISOString(),
      })),
    })
  }

  if (req.method === 'POST') {
    const { data, errors } = parseInput(agentInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
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

    const taken = await prisma.agent.findUnique({
      where: { projectId_slug: { projectId: data.projectId, slug: data.slug } },
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

    // Agent lahir bersama draf pertamanya, jadi tidak pernah ada agent tanpa
    // konfigurasi yang bisa dibuka di builder.
    const agent = await prisma.agent.create({
      data: {
        projectId: data.projectId,
        slug: data.slug,
        name: data.name,
        description: data.description || null,
        versions: {
          create: {
            version: 1,
            status: AgentVersionStatus.DRAFT,
            instructions: data.instructions,
            provider: data.provider,
            model: data.model,
            effort: data.effort,
            maxTokens: data.maxTokens,
            temperature: data.temperature,
          },
        },
      },
      select: { id: true, slug: true, name: true },
    })

    return sendSuccess(res, {
      status: 201,
      message: 'Agent berhasil dibuat',
      data: agent,
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'POST'])
}

export default withApi('agents', handler)
