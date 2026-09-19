import type { Prisma } from '@prisma/client'

import { conflictError, notFoundError } from '@/server/shared/http-error'
import type { UpdateToolsDto } from '../dto/tools.dto'
import { toolsRepository, type ToolsRepository } from '../repositories/tools.repository'

export class ToolsService {
  constructor(private readonly toolsRepository: ToolsRepository) {}

  // Versi agent yang sudah dipublikasikan tetap menunjuk tool ini, jadi
  // perubahan kontrak langsung berlaku — itu sebabnya definisi tool wajib
  // diperbarui bersama endpointnya.
  async changeTools(id: string, dto: UpdateToolsDto) {
    const tool = await this.fetchToolsRecord(id)

    if (tool.name !== dto.name) {
      const taken = await this.toolsRepository.getToolsByName(
        tool.integrationId,
        dto.name
      )

      if (taken) {
        throw conflictError(
          'NAME_TAKEN',
          `Tool bernama ${dto.name} sudah ada di integration ini.`
        )
      }
    }

    return this.toolsRepository.updateTools(id, {
      name: dto.name,
      description: dto.description,
      method: dto.method,
      path: dto.path,
      permission: dto.permission,
      inputSchema: dto.inputSchema as Prisma.InputJsonValue,
    })
  }

  async removeTools(id: string) {
    await this.fetchToolsRecord(id)

    return this.toolsRepository.deleteTools(id)
  }

  private async fetchToolsRecord(id: string) {
    const tool = await this.toolsRepository.getToolsById(id)

    if (!tool) {
      throw notFoundError('TOOL_NOT_FOUND', 'Tool dengan id itu tidak ada.')
    }

    return tool
  }
}

export const toolsService = new ToolsService(toolsRepository)
