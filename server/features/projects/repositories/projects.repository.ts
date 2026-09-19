import type { AgentEnvironment, AgentProvider } from '@prisma/client'

import { prismaService } from '../../../shared/prisma.service'
import { handlePrismaError } from '../../../shared/http-error'

export class ProjectsRepository {
  async getProjectsMany() {
    try {
      return await prismaService.project.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: { _count: { select: { agents: true, apiKeys: true } } },
      })
    } catch (error) {
      throw handlePrismaError(error, 'project')
    }
  }

  async getProjectsById(id: string) {
    try {
      return await prismaService.project.findUnique({
        where: { id },
        include: {
          agents: {
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            include: { _count: { select: { versions: true, runs: true } } },
          },
          apiKeys: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] },
          providerKeys: {
            orderBy: [{ provider: 'asc' }, { environment: 'asc' }],
          },
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'project')
    }
  }

  async getProjectsBySlug(slug: string) {
    try {
      return await prismaService.project.findUnique({
        where: { slug },
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'project')
    }
  }

  async postProjects(data: {
    slug: string
    name: string
    description: string | null
  }) {
    try {
      return await prismaService.project.create({
        data,
        select: { id: true, slug: true, name: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'project')
    }
  }

  async getProjectsKeysMany(projectId: string) {
    try {
      return await prismaService.projectApiKey.findMany({
        where: { projectId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      })
    } catch (error) {
      throw handlePrismaError(error, 'api key')
    }
  }

  async postProjectsKeys(data: {
    projectId: string
    name: string
    environment: AgentEnvironment
    prefix: string
    hash: string
  }) {
    try {
      return await prismaService.projectApiKey.create({
        data,
        select: { id: true, name: true, environment: true, prefix: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'api key')
    }
  }

  async getProjectsCredentialsMany(projectId: string) {
    try {
      return await prismaService.providerCredential.findMany({
        where: { projectId },
        orderBy: [{ provider: 'asc' }, { environment: 'asc' }],
        select: {
          id: true,
          provider: true,
          environment: true,
          hint: true,
          updatedAt: true,
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'kredensial provider')
    }
  }

  async updateProjectsCredentials(data: {
    projectId: string
    provider: AgentProvider
    environment: AgentEnvironment
    secret: string
    hint: string
  }) {
    try {
      return await prismaService.providerCredential.upsert({
        where: {
          projectId_provider_environment: {
            projectId: data.projectId,
            provider: data.provider,
            environment: data.environment,
          },
        },
        create: data,
        update: { secret: data.secret, hint: data.hint },
        select: { id: true, provider: true, environment: true, hint: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'kredensial provider')
    }
  }
}

export const projectsRepository = new ProjectsRepository()
