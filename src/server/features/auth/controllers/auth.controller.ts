import type { NextApiRequest, NextApiResponse } from 'next'

import { parseDto } from '@/server/shared/route'
import { sendSuccess } from '@/server/shared/response'
import { enforceRateLimit } from '@/server/shared/services/rateLimit.service'
import { loginAuthValidation } from '../dto/auth.dto'
import { authLoginService, type AuthLoginService } from '../services/auth.service'

export class AuthController {
  constructor(private readonly authLoginService: AuthLoginService) {}

  async saveAuthLogin(req: NextApiRequest, res: NextApiResponse) {
    // Rute berkata sandi selalu jadi sasaran tebakan beruntun, jadi batasnya
    // jauh lebih ketat daripada rute lain.
    await enforceRateLimit(req, { name: 'auth-login', limit: 10, windowMs: 60_000 })

    const dto = parseDto(loginAuthValidation, req.body)

    return sendSuccess(res, {
      message: 'Berhasil masuk',
      data: this.authLoginService.storeAuthLogin(dto),
    })
  }
}

export const authController = new AuthController(authLoginService)
