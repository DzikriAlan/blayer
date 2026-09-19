import { prismaService } from '@/server/shared/prisma.service'
import { handlePrismaError } from '@/server/shared/http-error'

export class KnowledgeRepository {
  async getKnowledgeMany(projectId: string) {
    try {
      return await prismaService.knowledgeDocument.findMany({
        where: { projectId },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      })
    } catch (error) {
      throw handlePrismaError(error, 'dokumen')
    }
  }

  async getKnowledgeById(id: string) {
    try {
      return await prismaService.knowledgeDocument.findUnique({ where: { id } })
    } catch (error) {
      throw handlePrismaError(error, 'dokumen')
    }
  }

  async postKnowledge(data: {
    projectId: string
    title: string
    content: string
  }) {
    try {
      return await prismaService.knowledgeDocument.create({
        data,
        select: { id: true, title: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'dokumen')
    }
  }

  async updateKnowledge(id: string, data: { title: string; content: string }) {
    try {
      return await prismaService.knowledgeDocument.update({
        where: { id },
        data,
        select: { id: true, title: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'dokumen')
    }
  }

  async deleteKnowledge(id: string) {
    try {
      return await prismaService.knowledgeDocument.delete({
        where: { id },
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'dokumen')
    }
  }
}

export const knowledgeRepository = new KnowledgeRepository()
