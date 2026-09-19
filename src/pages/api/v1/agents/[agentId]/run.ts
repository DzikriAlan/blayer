import type { NextApiRequest, NextApiResponse } from 'next'
import { AgentEnvironment } from '@prisma/client'

import { withApi } from '@/shared/lib/apiHandler'
import { getRunActor } from '@/shared/lib/agentAuth'
import { agentRunInputSchema, parseInput } from '@/shared/lib/agentInput'
import { RuntimeError, runAgent } from '@/shared/lib/agentRuntime'
import { getQueryId } from '@/shared/lib/apiQuery'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return sendMethodNotAllowed(res, req.method, ['POST'])

  const actor = await getRunActor(req, res)
  if (!actor) return

  if (
    !(await enforceRateLimit(req, res, {
      name: 'agents-run',
      limit: 60,
      windowMs: 60_000,
      scope: actor.kind === 'project' ? actor.projectId : 'admin',
    }))
  ) {
    return
  }

  const { data, errors } = parseInput(agentRunInputSchema, req.body)

  if (!data) {
    return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
  }

  // Project consumer selalu dilayani versi production di environment kuncinya.
  // Menunjuk versi tertentu adalah kewenangan Playground, bukan pemanggil luar.
  if (actor.kind === 'project' && data.versionId) {
    return sendFailure(res, {
      status: 403,
      message: 'API key project tidak boleh memilih versi',
      errors: [
        {
          code: 'VERSION_NOT_ALLOWED',
          field: 'versionId',
          message: 'Kunci project selalu menjalankan versi yang sedang production.',
        },
      ],
    })
  }

  const environment =
    actor.kind === 'project'
      ? actor.environment
      : (data.environment ?? AgentEnvironment.DEVELOPMENT)

  try {
    const result = await runAgent({
      agentId: getQueryId(req.query.agentId),
      environment,
      input: data.input,
      sessionId: data.sessionId ?? null,
      versionId: actor.kind === 'admin' ? (data.versionId ?? null) : null,
      scopedProjectId: actor.kind === 'project' ? actor.projectId : null,
    })

    return sendSuccess(res, {
      message: 'Agent berhasil dijalankan',
      data: result,
    })
  } catch (error) {
    if (error instanceof RuntimeError) {
      return sendFailure(res, {
        status: error.status,
        message: error.message,
        errors: [
          { code: error.code, field: error.field, message: error.message },
        ],
      })
    }

    throw error
  }
}

export default withApi('agents-run', handler)
