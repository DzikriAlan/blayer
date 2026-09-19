import type { NextApiRequest, NextApiResponse } from 'next'
import { AgentVersionStatus } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { agentPublishInputSchema, parseInput } from '@/shared/lib/agentInput'
import { getQueryId } from '@/shared/lib/apiQuery'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return
  if (req.method !== 'POST') return sendMethodNotAllowed(res, req.method, ['POST'])

  const agentId = getQueryId(req.query.agentId)
  const { data, errors } = parseInput(agentPublishInputSchema, req.body)

  if (!data) {
    return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
  }

  const version = await prisma.agentVersion.findFirst({
    where: { id: data.versionId, agentId },
    select: { id: true, version: true },
  })

  if (!version) {
    return sendFailure(res, {
      status: 404,
      message: 'Versi tidak ditemukan',
      errors: [
        {
          code: 'VERSION_NOT_FOUND',
          field: 'versionId',
          message: 'Versi itu bukan milik agent ini.',
        },
      ],
    })
  }

  // Versi lama tidak dihapus, hanya diarsipkan — rollback cukup mempublikasikan
  // kembali versi sebelumnya lewat rute yang sama.
  await prisma.$transaction([
    prisma.agentVersion.updateMany({
      where: { agentId, status: AgentVersionStatus.PUBLISHED },
      data: { status: AgentVersionStatus.ARCHIVED },
    }),
    prisma.agentVersion.update({
      where: { id: version.id },
      data: { status: AgentVersionStatus.PUBLISHED, publishedAt: new Date() },
    }),
    prisma.agent.update({
      where: { id: agentId },
      data: { productionVersionId: version.id },
    }),
  ])

  return sendSuccess(res, {
    message: `Versi ${version.version} sekarang melayani production`,
    data: { agentId, versionId: version.id, version: version.version },
  })
}

export default withApi('agents-publish', handler)
