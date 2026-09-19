import type { NextApiRequest, NextApiResponse } from 'next'
import { AgentRunStatus } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { getQueryId, getQueryLimit } from '@/shared/lib/apiQuery'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return
  if (req.method !== 'GET') return sendMethodNotAllowed(res, req.method, ['GET'])

  const agentId = getQueryId(req.query.agentId)

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { id: true },
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

  const limit = getQueryLimit(req.query.limit)
  const cursor = getQueryId(req.query.cursor)

  const runs = await prisma.agentRun.findMany({
    where: { agentId },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: { agentVersion: { select: { version: true } } },
  })

  const hasMore = runs.length > limit
  const items = hasMore ? runs.slice(0, limit) : runs

  const summary = await prisma.agentRun.aggregate({
    where: { agentId },
    _count: { _all: true },
    _sum: { inputTokens: true, outputTokens: true, costUsd: true },
    _avg: { latencyMs: true },
  })

  const failed = await prisma.agentRun.count({
    where: { agentId, status: AgentRunStatus.FAILED },
  })

  const totalRuns = summary._count._all

  return sendSuccess(res, {
    message: 'Riwayat eksekusi berhasil dimuat',
    data: {
      summary: {
        totalRuns,
        // Success rate dihitung dari eksekusi yang gagal ikut tercatat, bukan
        // hanya dari yang berhasil (PRD §2 — metrik keandalan).
        successRate:
          totalRuns > 0
            ? Math.round(((totalRuns - failed) / totalRuns) * 1000) / 10
            : 0,
        avgLatencyMs: Math.round(summary._avg.latencyMs ?? 0),
        totalInputTokens: summary._sum.inputTokens ?? 0,
        totalOutputTokens: summary._sum.outputTokens ?? 0,
        totalCostUsd: summary._sum.costUsd ?? 0,
      },
      runs: items.map((run) => ({
        id: run.id,
        version: run.agentVersion.version,
        environment: run.environment,
        status: run.status,
        provider: run.provider,
        model: run.model,
        input: run.input,
        output: run.output ?? '',
        errorCode: run.errorCode ?? '',
        errorMessage: run.errorMessage ?? '',
        inputTokens: run.inputTokens,
        outputTokens: run.outputTokens,
        costUsd: run.costUsd,
        latencyMs: run.latencyMs,
        createdAt: run.createdAt.toISOString(),
      })),
    },
    pagination: {
      limit,
      next_cursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
      has_more: hasMore,
    },
  })
}

export default withApi('agents-runs', handler)
