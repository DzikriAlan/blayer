import { HttpError } from '../../../shared/http-error'
import {
  createAdminSession,
  getAdminCredentials,
  verifyAdminCredentials,
} from '../../../shared/utils/session.util'
import { logger } from '@server/shared/utils/logger.util'
import type {
  AuthLoginResponseDto,
  CreateAuthLoginDto,
} from '../dto/auth.dto'

export class AuthLoginService {
  storeAuthLogin(dto: CreateAuthLoginDto): AuthLoginResponseDto {
    if (!verifyAdminCredentials(dto.username, dto.password)) {
      logger.warn('login pengelolaan gagal', { username: dto.username })

      // Pesannya tidak membedakan username salah dari kata sandi salah.
      throw new HttpError(
        401,
        'INVALID_CREDENTIALS',
        'Username atau kata sandi salah.'
      )
    }

    const credentials = getAdminCredentials()

    if (credentials.isDefault && process.env.NODE_ENV === 'production') {
      logger.warn('login memakai kredensial bawaan di produksi', {
        dampak: 'siapa pun yang tahu bawaannya bisa membuka console',
      })
    }

    return {
      ...createAdminSession(dto.username),
      isDefaultCredentials: credentials.isDefault,
    }
  }
}

export const authLoginService = new AuthLoginService()
