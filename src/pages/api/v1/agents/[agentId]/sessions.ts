import type { NextApiRequest, NextApiResponse } from 'next'
import { AgentEnvironment } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getRunActor } from '@/shared/lib/agentAuth'
import { parseInput, sessionInputSchema } from '@/shared/lib/agentInput'
import { getQueryId, getQueryLimit } from '@/shared/lib/apiQuery'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const actor = await getRunActor(req, res)
  if (!actor) return

  const agentId = getQueryId(req.query.agentId)

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { id: true, projectId: true },
  })

  if (
    !agent ||
    (actor.kind === 'project' && agent.projectId !== actor.projectId)
  ) {
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

  if (req.method === 'POST') {
    const { data, errors } = parseInput(sessionInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    // Sesi menyimpan ingatan percakapan dalam satu rangkaian. Environment-nya
    // mengikuti kunci pemanggil supaya ingatan development tidak tercampur
    // dengan production.
    const environment =
      actor.kind === 'project'
        ? actor.environment
        : (data.environment ?? AgentEnvironment.DEVELOPMENT)

    const session = await prisma.agentSession.create({
      data: { projectId: agent.projectId, agentId: agent.id, environment },
      select: { id: true, environment: true, createdAt: true },
    })

    return sendSuccess(res, {
      status: 201,
      message: 'Sesi percakapan berhasil dibuat',
      data: { ...session, createdAt: session.createdAt.toISOString() },
    })
  }

  if (req.method === 'GET') {
    const limit = getQueryLimit(req.query.limit)

    const sessions = await prisma.agentSession.findMany({
      where: { agentId },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: limit,
      include: { _count: { select: { messages: true } } },
    })

    return sendSuccess(res, {
      message: 'Daftar sesi berhasil dimuat',
      data: sessions.map((session) => ({
        id: session.id,
        environment: session.environment,
        totalMessages: session._count.messages,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      })),
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'POST'])
}

export default withApi('agents-sessions', handler)
