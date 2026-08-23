import type { NextApiRequest, NextApiResponse } from 'next'
import { withApi } from '@/shared/lib/apiHandler'
import { sendFailure, sendMethodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import {
  getSupabaseSetupMessage,
  isSupabaseReady,
  supabase,
} from '@/shared/lib/supabase'
import {
  getEmailFromUsername,
  getNormalizedUsername,
  getPasswordProblem,
  getUsernameProblem,
} from '@/shared/lib/authIdentity'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, req.method, ['POST'])
  }

  if (
    !(await enforceRateLimit(req, res, {
      name: 'auth-register',
      limit: 5,
      windowMs: 10 * 60_000,
    }))
  ) {
    return
  }

  if (!isSupabaseReady || !supabase) {
    return sendFailure(res, {
      status: 503,
      message: getSupabaseSetupMessage(),
      errors: [{ code: 'SERVICE_UNAVAILABLE', field: '', message: getSupabaseSetupMessage() }],
    })
  }

  const { username, password } = req.body as {
    username?: string
    password?: string
  }

  const problem =
    getUsernameProblem(username ?? '') || getPasswordProblem(password ?? '')

  if (problem) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'INVALID_CREDENTIALS_FORMAT', field: 'username', message: problem }],
    })
  }

  const name = getNormalizedUsername(username ?? '')

  const { data, error } = await supabase.auth.admin.createUser({
    email: getEmailFromUsername(name),
    password,
    email_confirm: true,
    user_metadata: { username: name, full_name: name },
  })

  if (error) {
    const isTaken =
      error.status === 422 ||
      /already|exist|registered/i.test(error.message ?? '')

    const message = isTaken
      ? 'Username itu sudah dipakai. Coba username lain.'
      : error.message || 'Pendaftaran gagal. Coba lagi sebentar lagi.'

    return sendFailure(res, {
      status: isTaken ? 409 : 500,
      message,
      errors: [
        {
          code: isTaken ? 'USERNAME_TAKEN' : 'REGISTER_FAILED',
          field: isTaken ? 'username' : '',
          message,
        },
      ],
    })
  }

  return sendSuccess(res, {
    status: 201,
    message: 'Akun berhasil dibuat',
    data: { id: data.user?.id ?? '', username: name },
  })
}

export default withApi('auth-register', handler)
