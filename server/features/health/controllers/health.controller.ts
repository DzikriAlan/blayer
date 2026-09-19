import type { NextApiRequest, NextApiResponse } from 'next'

import { sendSuccess } from '../../../shared/response'
import { healthService, type HealthService } from '../services/health.service'

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  async loadHealth(_req: NextApiRequest, res: NextApiResponse) {
    return sendSuccess(res, {
      message: 'Layanan siap',
      data: await this.healthService.fetchHealth(),
    })
  }
}

export const healthController = new HealthController(healthService)
