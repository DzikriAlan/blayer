import type { NextApiRequest, NextApiResponse } from 'next'

import { sendSuccess } from '../../../shared/response'
import { getQueryValue, parseDto } from '../../../shared/route'
import { authService } from '../../../shared/services/auth.service'
import { updateToolsValidation } from '../dto/tools.dto'
import { toolsService, type ToolsService } from '../services/tools.service'

export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  async modifyTools(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(updateToolsValidation, req.body)

    return sendSuccess(res, {
      message: 'Tool berhasil diperbarui',
      data: await this.toolsService.changeTools(
        getQueryValue(req.query.toolId),
        dto
      ),
    })
  }

  async destroyTools(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Tool berhasil dihapus',
      data: await this.toolsService.removeTools(getQueryValue(req.query.toolId)),
    })
  }
}

export const toolsController = new ToolsController(toolsService)
