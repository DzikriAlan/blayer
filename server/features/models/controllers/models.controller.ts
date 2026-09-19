import type { NextApiRequest, NextApiResponse } from 'next'

import { sendSuccess } from '../../../shared/response'
import { authService } from '../../../shared/services/auth.service'
import { modelsService, type ModelsService } from '../services/models.service'

export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  loadModels(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Katalog model berhasil dimuat',
      data: this.modelsService.fetchModels(),
    })
  }
}

export const modelsController = new ModelsController(modelsService)
