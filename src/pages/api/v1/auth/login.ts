import type { NextApiRequest, NextApiResponse } from 'next'

import { withApi } from '@/shared/lib/apiHandler'
import { loginInputSchema, parseInput } from '@/shared/lib/agentInput'
import {
  createAdminSession,
  getAdminCredentials,
  verifyAdminCredentials,
} from '@/shared/lib/adminSession'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import { logger } from '@/shared/lib/logger'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return sendMethodNotAllowed(res, req.method, ['POST'])

  // Rute berkata sandi selalu jadi sasaran tebakan beruntun, jadi batasnya jauh
  // lebih ketat daripada rute lain.
  if (
    !(await enforceRateLimit(req, res, {
      name: 'auth-login',
      limit: 10,
      windowMs: 60_000,
    }))
  ) {
    return
  }

  const { data, errors } = parseInput(loginInputSchema, req.body)

  if (!data) {
    return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
  }

  if (!verifyAdminCredentials(data.username, data.password)) {
    logger.warn('login pengelolaan gagal', { username: data.username })

    // Pesannya tidak membedakan username salah dari kata sandi salah.
    return sendFailure(res, {
      status: 401,
      message: 'Username atau kata sandi salah.',
      errors: [
        {
          code: 'INVALID_CREDENTIALS',
          field: 'password',
          message: 'Username atau kata sandi salah.',
        },
      ],
    })
  }

  const credentials = getAdminCredentials()

  if (credentials.isDefault && process.env.NODE_ENV === 'production') {
    logger.warn('login memakai kredensial bawaan di produksi', {
      dampak: 'siapa pun yang tahu bawaannya bisa membuka console',
    })
  }

  return sendSuccess(res, {
    message: 'Berhasil masuk',
    data: {
      ...createAdminSession(data.username),
      isDefaultCredentials: credentials.isDefault,
    },
  })
}

export default withApi('auth-login', handler)
