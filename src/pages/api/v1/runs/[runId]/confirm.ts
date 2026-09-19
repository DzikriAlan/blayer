import type { NextApiRequest, NextApiResponse } from 'next'

import { withApi } from '@/shared/lib/apiHandler'
import { getRunActor } from '@/shared/lib/agentAuth'
import { agentConfirmInputSchema, parseInput } from '@/shared/lib/agentInput'
import { RuntimeError, resumeRun } from '@/shared/lib/agentRuntime'
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
      name: 'runs-confirm',
      limit: 60,
      windowMs: 60_000,
      scope: actor.kind === 'project' ? actor.projectId : 'admin',
    }))
  ) {
    return
  }

  const { data, errors } = parseInput(agentConfirmInputSchema, req.body)

  if (!data) {
    return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
  }

  try {
    // Konfirmasi selalu datang dari pemanggil, tidak pernah diputuskan sendiri
    // oleh model — itu inti guardrail tool tulis di PRD §5.
    const result = await resumeRun({
      runId: getQueryId(req.query.runId),
      toolCallId: data.toolCallId,
      isConfirmed: data.decision === 'CONFIRM',
      scopedProjectId: actor.kind === 'project' ? actor.projectId : null,
    })

    return sendSuccess(res, {
      message:
        data.decision === 'CONFIRM'
          ? 'Tool dijalankan dan eksekusi dilanjutkan'
          : 'Tool ditolak; eksekusi dilanjutkan tanpa menjalankannya',
      data: result,
    })
  } catch (error) {
    if (error instanceof RuntimeError) {
      return sendFailure(res, {
        status: error.status,
        message: error.message,
        errors: [{ code: error.code, field: error.field, message: error.message }],
      })
    }

    throw error
  }
}

export default withApi('runs-confirm', handler)
