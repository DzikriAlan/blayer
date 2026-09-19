import type { NextApiRequest, NextApiResponse } from 'next'
import { AgentVersionStatus } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { agentVersionInputSchema, parseInput } from '@/shared/lib/agentInput'
import { getQueryId } from '@/shared/lib/apiQuery'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return

  const agentId = getQueryId(req.query.agentId)

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { id: true, productionVersionId: true },
  })

  if (!agent) {
    return sendFailure(res, {
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
  }

  if (req.method === 'GET') {
    const versions = await prisma.agentVersion.findMany({
      where: { agentId },
      orderBy: { version: 'desc' },
      include: {
        tools: { select: { toolDefinitionId: true } },
        documents: { select: { documentId: true } },
      },
    })

    return sendSuccess(res, {
      message: 'Daftar versi berhasil dimuat',
      data: versions.map((version) => ({
        id: version.id,
        version: version.version,
        status: version.status,
        instructions: version.instructions,
        provider: version.provider,
        model: version.model,
        effort: version.effort,
        maxTokens: version.maxTokens,
        temperature: version.temperature,
        toolIds: version.tools.map((item) => item.toolDefinitionId),
        documentIds: version.documents.map((item) => item.documentId),
        isProduction: version.id === agent.productionVersionId,
        publishedAt: version.publishedAt?.toISOString() ?? '',
        createdAt: version.createdAt.toISOString(),
      })),
    })
  }

  if (req.method === 'POST') {
    const { data, errors } = parseInput(agentVersionInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    // Perubahan konfigurasi selalu lahir sebagai draf baru. Versi yang sedang
    // melayani production tidak pernah ikut berubah (PRD §5 — Agent Versioning).
    const last = await prisma.agentVersion.findFirst({
      where: { agentId },
      orderBy: { version: 'desc' },
      select: { version: true },
    })

    const version = await prisma.agentVersion.create({
      data: {
        agentId,
        version: (last?.version ?? 0) + 1,
        status: AgentVersionStatus.DRAFT,
        instructions: data.instructions,
        provider: data.provider,
        model: data.model,
        effort: data.effort,
        maxTokens: data.maxTokens,
        temperature: data.temperature,
        // Tool dan dokumen menempel pada versi, bukan pada agent. Versi lama
        // tetap memakai daftar yang berlaku saat ia dipublikasikan.
        tools: { create: data.toolIds.map((toolDefinitionId) => ({ toolDefinitionId })) },
        documents: { create: data.documentIds.map((documentId) => ({ documentId })) },
      },
      select: { id: true, version: true, status: true },
    })

    return sendSuccess(res, {
      status: 201,
      message: `Draf versi ${version.version} berhasil dibuat`,
      data: version,
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'POST'])
}

export default withApi('agents-versions', handler)
