import type { Prisma } from '@prisma/client'
import {
  AgentEnvironment,
  AgentMessageRole,
  AgentProvider,
  AgentRunStatus,
  ToolCallStatus,
  ToolPermission,
} from '@prisma/client'

import { prismaService } from '../prisma.service'
import { handlePrismaError } from '../http-error'

// Seluruh query Prisma milik runtime agent berkumpul di sini; service-nya tidak
// pernah menyentuh Prisma langsung.
export class AgentRuntimeRepository {
  async getAgentRuntimeAgent(agentId: string) {
    try {
      return await prismaService.agent.findUnique({ where: { id: agentId } })
    } catch (error) {
      throw handlePrismaError(error, 'agent')
    }
  }

  async getAgentRuntimeVersion(agentId: string, versionId: string) {
    try {
      return await prismaService.agentVersion.findFirst({
        where: { id: versionId, agentId },
        include: {
          tools: {
            include: { toolDefinition: { include: { integration: true } } },
          },
          documents: { include: { document: true } },
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'versi agent')
    }
  }

  async getAgentRuntimeVersionById(versionId: string) {
    try {
      return await prismaService.agentVersion.findUnique({
        where: { id: versionId },
        include: {
          tools: {
            include: { toolDefinition: { include: { integration: true } } },
          },
          documents: { include: { document: true } },
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'versi agent')
    }
  }

  async getAgentRuntimeCredential(
    projectId: string,
    provider: AgentProvider,
    environment: AgentEnvironment
  ) {
    try {
      return await prismaService.providerCredential.findUnique({
        where: {
          projectId_provider_environment: { projectId, provider, environment },
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'kredensial provider')
    }
  }

  async getAgentRuntimeSession(sessionId: string, agentId: string) {
    try {
      return await prismaService.agentSession.findFirst({
        where: { id: sessionId, agentId },
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'sesi')
    }
  }

  async getAgentRuntimeMessageMany(sessionId: string, take: number) {
    try {
      return await prismaService.agentMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take,
      })
    } catch (error) {
      throw handlePrismaError(error, 'pesan sesi')
    }
  }

  async postAgentRuntimeMessageMany(
    sessionId: string,
    input: string,
    output: string
  ) {
    try {
      await prismaService.agentMessage.createMany({
        data: [
          { sessionId, role: AgentMessageRole.USER, content: input },
          { sessionId, role: AgentMessageRole.ASSISTANT, content: output },
        ],
      })

      return await prismaService.agentSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'pesan sesi')
    }
  }

  async postAgentRuntimeRun(data: Prisma.AgentRunUncheckedCreateInput) {
    try {
      return await prismaService.agentRun.create({ data, select: { id: true } })
    } catch (error) {
      throw handlePrismaError(error, 'eksekusi agent')
    }
  }

  async updateAgentRuntimeRun(
    id: string,
    data: Prisma.AgentRunUncheckedUpdateInput
  ) {
    try {
      return await prismaService.agentRun.update({
        where: { id },
        data,
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'eksekusi agent')
    }
  }

  async postAgentRuntimeToolCall(data: Prisma.AgentToolCallUncheckedCreateInput) {
    try {
      return await prismaService.agentToolCall.create({
        data,
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'pemanggilan tool')
    }
  }

  async updateAgentRuntimeToolCall(
    id: string,
    data: Prisma.AgentToolCallUncheckedUpdateInput
  ) {
    try {
      return await prismaService.agentToolCall.update({
        where: { id },
        data,
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'pemanggilan tool')
    }
  }

  async getAgentRuntimeToolCall(toolCallId: string, runId: string) {
    try {
      return await prismaService.agentToolCall.findFirst({
        where: { id: toolCallId, runId },
        include: {
          toolDefinition: { include: { integration: true } },
          run: { include: { agent: true } },
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'pemanggilan tool')
    }
  }
}

export const agentRuntimeRepository = new AgentRuntimeRepository()

export { AgentRunStatus, ToolCallStatus, ToolPermission }
