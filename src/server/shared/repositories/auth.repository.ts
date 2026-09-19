import { prismaService } from '../prisma.service'
import { handlePrismaError } from '../http-error'

// Satu-satunya tempat query Prisma untuk kebutuhan autentikasi lintas feature.
export class AuthRepository {
  async getAuthApiKeyByHash(hash: string) {
    try {
      return await prismaService.projectApiKey.findUnique({
        where: { hash },
        select: {
          id: true,
          projectId: true,
          environment: true,
          revokedAt: true,
        },
      })
    } catch (error) {
      throw handlePrismaError(error, 'api key')
    }
  }

  async patchAuthApiKeyUsage(id: string) {
    try {
      return await prismaService.projectApiKey.update({
        where: { id },
        data: { lastUsedAt: new Date() },
        select: { id: true },
      })
    } catch (error) {
      throw handlePrismaError(error, 'api key')
    }
  }
}

export const authRepository = new AuthRepository()
