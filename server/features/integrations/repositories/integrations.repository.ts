import type { Prisma } from '@prisma/client'

import { prismaService } from '../../../shared/prisma.service'
import { handlePrismaError } from '../../../shared/http-error'

export class IntegrationsRepository {
  async getIntegrationsMany(projectId: string) {
    try {
      return await prismaService.integration.findMany({
        where: { projectId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          tools: { orderBy: { name: 'asc' } },
          _count: { select: { tools: true } },
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'integration')
    }
  }

  async getIntegrationsById(id: string) {
    try {
      return await prismaService.integration.findUnique({
        where: { id },
        include: {
          tools: { orderBy: { name: 'asc' } },
          _count: { select: { tools: true } },
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'integration')
    }
  }

  async getIntegrationsBySlug(projectId: string, slug: string) {
    try {
      return await prismaService.integration.findUnique({
        where: { projectId_slug: { projectId, slug } },
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'integration')
    }
  }

  async postIntegrations(data: Prisma.IntegrationUncheckedCreateInput) {
    try {
      return await prismaService.integration.create({
        data,
        select: { id: true, slug: true, name: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'integration')
    }
  }

  async updateIntegrations(
    id: string,
    data: Prisma.IntegrationUncheckedUpdateInput
  ) {
    try {
      return await prismaService.integration.update({
        where: { id },
        data,
        select: { id: true, slug: true, name: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'integration')
    }
  }

  async deleteIntegrations(id: string) {
    try {
      return await prismaService.integration.delete({
        where: { id },
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'integration')
    }
  }

  async getIntegrationsToolsMany(integrationId: string) {
    try {
      return await prismaService.toolDefinition.findMany({
        where: { integrationId },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      throw handlePrismaError(error, 'tool')
    }
  }

  async getIntegrationsToolsByName(integrationId: string, name: string) {
    try {
      return await prismaService.toolDefinition.findUnique({
        where: { integrationId_name: { integrationId, name } },
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'tool')
    }
  }

  async postIntegrationsTools(data: Prisma.ToolDefinitionUncheckedCreateInput) {
    try {
      return await prismaService.toolDefinition.create({
        data,
        select: { id: true, name: true, permission: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'tool')
    }
  }
}

export const integrationsRepository = new IntegrationsRepository()
