import type { NextApiRequest, NextApiResponse } from 'next'

import { sendSuccess } from '@/server/shared/response'
import { getQueryValue, parseDto } from '@/server/shared/route'
import { authService } from '@/server/shared/services/auth.service'
import { enforceRateLimit } from '@/server/shared/services/rateLimit.service'
import { createRunsConfirmValidation } from '../dto/runs.dto'
import { runsService, type RunsService } from '../services/runs.service'

export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  async saveRunsConfirm(req: NextApiRequest, res: NextApiResponse) {
    const actor = await authService.fetchAuthActor(req)

    await enforceRateLimit(req, {
      name: 'runs-confirm',
      limit: 60,
      windowMs: 60_000,
      scope: actor.kind === 'project' ? actor.projectId : 'admin',
    })

    const dto = parseDto(createRunsConfirmValidation, req.body)

    return sendSuccess(res, {
      message:
        dto.decision === 'CONFIRM'
          ? 'Tool dijalankan dan eksekusi dilanjutkan'
          : 'Tool ditolak; eksekusi dilanjutkan tanpa menjalankannya',
      data: await this.runsService.storeRunsConfirm(
        getQueryValue(req.query.runId),
        dto,
        actor.kind === 'project' ? actor.projectId : null
      ),
    })
  }
}

export const runsController = new RunsController(runsService)
