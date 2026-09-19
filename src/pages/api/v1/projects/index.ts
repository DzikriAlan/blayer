import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { parseInput, projectInputSchema } from '@/shared/lib/agentInput'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return

  if (req.method === 'GET') {
    const projects = await prisma.project.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { _count: { select: { agents: true, apiKeys: true } } },
    })

    return sendSuccess(res, {
      message: 'Daftar project berhasil dimuat',
      data: projects.map((project) => ({
        id: project.id,
        slug: project.slug,
        name: project.name,
        description: project.description ?? '',
        totalAgents: project._count.agents,
        totalApiKeys: project._count.apiKeys,
        createdAt: project.createdAt.toISOString(),
      })),
    })
  }

  if (req.method === 'POST') {
    const { data, errors } = parseInput(projectInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    const taken = await prisma.project.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    })

    if (taken) {
      return sendFailure(res, {
        status: 409,
        message: 'Slug project sudah dipakai',
        errors: [
          {
            code: 'SLUG_TAKEN',
            field: 'slug',
            message: `Slug ${data.slug} sudah dipakai project lain.`,
          },
        ],
      })
    }

    const project = await prisma.project.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description || null,
      },
      select: { id: true, slug: true, name: true },
    })

    return sendSuccess(res, {
      status: 201,
      message: 'Project berhasil dibuat',
      data: project,
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'POST'])
}

export default withApi('projects', handler)
