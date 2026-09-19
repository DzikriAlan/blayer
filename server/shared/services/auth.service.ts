import type { NextApiRequest } from 'next'
import type { AgentEnvironment } from '@prisma/client'

import { unauthorizedError } from '../http-error'
import { hashToken } from '../utils/crypto.util'
import { isAdminToken } from '../utils/session.util'
import { authRepository, type AuthRepository } from '../repositories/auth.repository'

export interface AdminActor {
  kind: 'admin'
}

export interface ProjectActor {
  kind: 'project'
  projectId: string
  environment: AgentEnvironment
}

export type RequestActor = AdminActor | ProjectActor

// Guard dipakai lintas feature, jadi tempatnya di shared service. Yang dikenal
// hanya dua: operator instance dan API key milik satu project.
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  fetchAuthAdmin(req: NextApiRequest): AdminActor {
    if (!isAdminToken(this.getBearerToken(req))) {
      throw unauthorizedError(
        'Sesi pengelolaan tidak dikenali atau sudah kedaluwarsa.'
      )
    }

    return { kind: 'admin' }
  }

  async fetchAuthActor(req: NextApiRequest): Promise<RequestActor> {
    const token = this.getBearerToken(req)

    if (!token) throw unauthorizedError('Kredensial tidak dikirim.')
    if (isAdminToken(token)) return { kind: 'admin' }

    const apiKey = await this.authRepository.getAuthApiKeyByHash(hashToken(token))

    if (!apiKey || apiKey.revokedAt) {
      throw unauthorizedError('API key project tidak dikenali.')
    }

    await this.authRepository.patchAuthApiKeyUsage(apiKey.id)

    return {
      kind: 'project',
      projectId: apiKey.projectId,
      environment: apiKey.environment,
    }
  }

  private getBearerToken(req: NextApiRequest) {
    const header = req.headers.authorization ?? ''

    return header.startsWith('Bearer ')
      ? header.slice('Bearer '.length).trim()
      : ''
  }
}

export const authService = new AuthService(authRepository)
