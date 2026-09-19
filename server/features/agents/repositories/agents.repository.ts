import {
  AgentEnvironment,
  AgentRunStatus,
  AgentVersionStatus,
  type Prisma,
} from '@prisma/client'

import { prismaService } from '../../../shared/prisma.service'
import { handlePrismaError } from '../../../shared/http-error'

export class AgentsRepository {
  async getAgentsMany(projectId: string) {
    try {
      return await prismaService.agent.findMany({
        where: projectId ? { projectId } : {},
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          project: { select: { id: true, slug: true, name: true } },
          _count: { select: { versions: true, runs: true } },
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'agent')
    }
  }

  async getAgentsById(id: string) {
    try {
      return await prismaService.agent.findUnique({
        where: { id },
        include: {
          project: { select: { id: true, slug: true, name: true } },
          versions: {
            orderBy: { version: 'desc' },
            include: {
              tools: { select: { toolDefinitionId: true } },
              documents: { select: { documentId: true } },
            },
          },
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'agent')
    }
  }

  async getAgentsBySlug(projectId: string, slug: string) {
    try {
      return await prismaService.agent.findUnique({
        where: { projectId_slug: { projectId, slug } },
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'agent')
    }
  }

  async postAgents(data: Prisma.AgentUncheckedCreateInput) {
    try {
      return await prismaService.agent.create({
        data,
        select: { id: true, slug: true, name: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'agent')
    }
  }

  async updateAgents(id: string, data: Prisma.AgentUncheckedUpdateInput) {
    try {
      return await prismaService.agent.update({
        where: { id },
        data,
        select: { id: true, slug: true, name: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'agent')
    }
  }

  async deleteAgents(id: string) {
    try {
      // Tautan ke versi production dilepas lebih dulu; tanpa itu penghapusan
      // tertahan oleh kunci asing yang menunjuk versinya sendiri.
      await prismaService.agent.update({
        where: { id },
        data: { productionVersionId: null },
      })

      return await prismaService.agent.delete({
        where: { id },
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'agent')
    }
  }

  async getAgentsVersionsMany(agentId: string) {
    try {
      return await prismaService.agentVersion.findMany({
        where: { agentId },
        orderBy: { version: 'desc' },
        include: {
          tools: { select: { toolDefinitionId: true } },
          documents: { select: { documentId: true } },
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'versi agent')
    }
  }

  async getAgentsVersionsLast(agentId: string) {
    try {
      return await prismaService.agentVersion.findFirst({
        where: { agentId },
        orderBy: { version: 'desc' },
        select: { version: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'versi agent')
    }
  }

  async getAgentsVersionsById(agentId: string, versionId: string) {
    try {
      return await prismaService.agentVersion.findFirst({
        where: { id: versionId, agentId },
        select: { id: true, version: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'versi agent')
    }
  }

  async postAgentsVersions(data: Prisma.AgentVersionUncheckedCreateInput) {
    try {
      return await prismaService.agentVersion.create({
        data,
        select: { id: true, version: true, status: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'versi agent')
    }
  }

  // Versi lama diarsipkan, bukan dihapus: rollback cukup mempublikasikan versi
  // sebelumnya kembali.
  async updateAgentsPublish(agentId: string, versionId: string) {
    try {
      return await prismaService.$transaction([
        prismaService.agentVersion.updateMany({
          where: { agentId, status: AgentVersionStatus.PUBLISHED },
          data: { status: AgentVersionStatus.ARCHIVED },
        }),
        prismaService.agentVersion.update({
          where: { id: versionId },
          data: {
            status: AgentVersionStatus.PUBLISHED,
            publishedAt: new Date(),
          },
        }),
        prismaService.agent.update({
          where: { id: agentId },
          data: { productionVersionId: versionId },
        }),
      ])
    } catch (error) {
      throw handlePrismaError(error, 'versi agent')
    }
  }

  async getAgentsRunsMany(agentId: string, skip: number, take: number) {
    try {
      return await prismaService.agentRun.findMany({
        where: { agentId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take,
        include: {
          agentVersion: { select: { version: true } },
          toolCalls: {
            select: { id: true, name: true, permission: true, status: true },
          },
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'eksekusi agent')
    }
  }

  async getAgentsRunsSummary(agentId: string) {
    try {
      const [summary, failed] = await prismaService.$transaction([
        prismaService.agentRun.aggregate({
          where: { agentId },
          _count: { _all: true },
          _sum: { inputTokens: true, outputTokens: true, costUsd: true },
          _avg: { latencyMs: true },
        }),
        prismaService.agentRun.count({
          where: { agentId, status: AgentRunStatus.FAILED },
        }),
      ])

      return { summary, failed }
    } catch (error) {
      throw handlePrismaError(error, 'eksekusi agent')
    }
  }

  async getAgentsSessionsMany(agentId: string, take: number) {
    try {
      return await prismaService.agentSession.findMany({
        where: { agentId },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take,
        include: { _count: { select: { messages: true } } },
      })
    } catch (error) {
      throw handlePrismaError(error, 'sesi')
    }
  }

  async postAgentsSessions(data: {
    projectId: string
    agentId: string
    environment: AgentEnvironment
  }) {
    try {
      return await prismaService.agentSession.create({
        data,
        select: { id: true, environment: true, createdAt: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'sesi')
    }
  }
}

export const agentsRepository = new AgentsRepository()
