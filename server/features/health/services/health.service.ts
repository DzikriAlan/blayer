import { serviceUnavailableError } from '../../../shared/http-error'
import { getRateLimitStore } from '../../../shared/services/rateLimitStore.service'
import {
  healthRepository,
  type HealthRepository,
} from '../repositories/health.repository'

export interface HealthResponseDto {
  isReady: boolean
  databaseMs: number
  rateLimitStore: string
  uptimeSeconds: number
}

export class HealthService {
  constructor(private readonly healthRepository: HealthRepository) {}

  async fetchHealth(): Promise<HealthResponseDto> {
    const database = await this.healthRepository.getHealthDatabase()

    if (!database.isReady) {
      throw serviceUnavailableError(
        'DATABASE_UNAVAILABLE',
        'Basis data tidak menjawab.'
      )
    }

    return {
      isReady: true,
      databaseMs: database.durationMs,
      rateLimitStore: getRateLimitStore().name,
      uptimeSeconds: Math.round(process.uptime()),
    }
  }
}

export const healthService = new HealthService(healthRepository)
