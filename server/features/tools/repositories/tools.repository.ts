import type { Prisma } from '@prisma/client'

import { prismaService } from '../../../shared/prisma.service'
import { handlePrismaError } from '../../../shared/http-error'

export class ToolsRepository {
  async getToolsById(id: string) {
    try {
      return await prismaService.toolDefinition.findUnique({
        where: { id },
        select: { id: true, integrationId: true, name: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'tool')
    }
  }

  async getToolsByName(integrationId: string, name: string) {
    try {
      return await prismaService.toolDefinition.findUnique({
        where: { integrationId_name: { integrationId, name } },
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'tool')
    }
  }

  async updateTools(id: string, data: Prisma.ToolDefinitionUncheckedUpdateInput) {
    try {
      return await prismaService.toolDefinition.update({
        where: { id },
        data,
        select: { id: true, name: true, permission: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'tool')
    }
  }

  async deleteTools(id: string) {
    try {
      return await prismaService.toolDefinition.delete({
        where: { id },
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'tool')
    }
  }
}

export const toolsRepository = new ToolsRepository()
