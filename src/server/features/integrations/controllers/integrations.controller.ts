import type { NextApiRequest, NextApiResponse } from 'next'

import { sendSuccess } from '@/server/shared/response'
import { getQueryValue, parseDto } from '@/server/shared/route'
import { authService } from '@/server/shared/services/auth.service'
import {
  createIntegrationsToolsValidation,
  createIntegrationsValidation,
} from '../dto/integrations.dto'
import {
  integrationsService,
  type IntegrationsService,
} from '../services/integrations.service'

export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  async loadIntegrationsList(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Daftar integration berhasil dimuat',
      data: await this.integrationsService.fetchIntegrationsList(
        getQueryValue(req.query.projectId)
      ),
    })
  }

  async saveIntegrations(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(createIntegrationsValidation, req.body)

    return sendSuccess(res, {
      status: 201,
      message: 'Integration berhasil dibuat',
      data: await this.integrationsService.storeIntegrations(
        getQueryValue(req.query.projectId),
        dto
      ),
    })
  }

  async loadIntegrations(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Integration berhasil dimuat',
      data: await this.integrationsService.fetchIntegrations(
        getQueryValue(req.query.integrationId)
      ),
    })
  }

  async modifyIntegrations(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(createIntegrationsValidation, req.body)

    return sendSuccess(res, {
      message: 'Integration berhasil diperbarui',
      data: await this.integrationsService.changeIntegrations(
        getQueryValue(req.query.integrationId),
        dto
      ),
    })
  }

  async destroyIntegrations(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Integration berhasil dihapus',
      data: await this.integrationsService.removeIntegrations(
        getQueryValue(req.query.integrationId)
      ),
    })
  }

  async loadIntegrationsToolsList(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Daftar tool berhasil dimuat',
      data: await this.integrationsService.fetchIntegrationsToolsList(
        getQueryValue(req.query.integrationId)
      ),
    })
  }

  async saveIntegrationsTools(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(createIntegrationsToolsValidation, req.body)

    return sendSuccess(res, {
      status: 201,
      message: 'Tool berhasil didaftarkan',
      data: await this.integrationsService.storeIntegrationsTools(
        getQueryValue(req.query.integrationId),
        dto
      ),
    })
  }
}

export const integrationsController = new IntegrationsController(
  integrationsService
)
