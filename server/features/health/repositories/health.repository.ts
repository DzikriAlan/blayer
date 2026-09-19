import { prismaService } from '../../../shared/prisma.service'

const DATABASE_TIMEOUT_MS = 3_000

export class HealthRepository {
  // Kesiapan basis data diukur, bukan diasumsikan. Query-nya dibatasi waktu
  // supaya rute ini tidak ikut menggantung saat basis datanya diam.
  async getHealthDatabase() {
    const startedAt = Date.now()

    try {
      await Promise.race([
        prismaService.$queryRaw`SELECT 1`,
        new Promise((_resolve, reject) =>
          setTimeout(
            () => reject(new Error('database tidak menjawab')),
            DATABASE_TIMEOUT_MS
          )
        ),
      ])

      return { isReady: true, durationMs: Date.now() - startedAt }
    } catch {
      return { isReady: false, durationMs: Date.now() - startedAt }
    }
  }
}

export const healthRepository = new HealthRepository()
