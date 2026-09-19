import type { NextApiRequest, NextApiResponse } from 'next'

import { sendSuccess } from '../../../shared/response'
import { getQueryValue, parseDto } from '../../../shared/route'
import { authService } from '../../../shared/services/auth.service'
import {
  createKnowledgeValidation,
  updateKnowledgeValidation,
} from '../dto/knowledge.dto'
import {
  knowledgeService,
  type KnowledgeService,
} from '../services/knowledge.service'

export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  async loadKnowledgeList(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Daftar dokumen berhasil dimuat',
      data: await this.knowledgeService.fetchKnowledgeList(
        getQueryValue(req.query.projectId)
      ),
    })
  }

  async saveKnowledge(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(createKnowledgeValidation, req.body)

    return sendSuccess(res, {
      status: 201,
      message: 'Dokumen berhasil disimpan',
      data: await this.knowledgeService.storeKnowledge(
        getQueryValue(req.query.projectId),
        dto
      ),
    })
  }

  async loadKnowledge(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Dokumen berhasil dimuat',
      data: await this.knowledgeService.fetchKnowledge(
        getQueryValue(req.query.documentId)
      ),
    })
  }

  async modifyKnowledge(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(updateKnowledgeValidation, req.body)

    return sendSuccess(res, {
      message: 'Dokumen berhasil diperbarui',
      data: await this.knowledgeService.changeKnowledge(
        getQueryValue(req.query.documentId),
        dto
      ),
    })
  }

  async destroyKnowledge(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Dokumen berhasil dihapus',
      data: await this.knowledgeService.removeKnowledge(
        getQueryValue(req.query.documentId)
      ),
    })
  }
}

export const knowledgeController = new KnowledgeController(knowledgeService)
