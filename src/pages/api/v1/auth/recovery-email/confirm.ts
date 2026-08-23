import type { NextApiRequest, NextApiResponse } from 'next'

import { withApi } from '@/shared/lib/apiHandler'
import { sendFailure, sendMethodNotAllowed } from '@/shared/lib/apiResponse'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import { getSupabaseSetupMessage, isSupabaseReady, supabase } from '@/shared/lib/supabase'
import {
  isTokenAlive,
  isTokenMatching,
  type RecoveryMetadata,
} from '@/shared/lib/recoveryEmail'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, req.method, ['GET'])
  }

  if (
    !(await enforceRateLimit(req, res, {
      name: 'recovery-email-confirm',
      limit: 30,
      windowMs: 60 * 60_000,
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

  const uid = String(req.query.uid ?? '')
  const token = String(req.query.token ?? '')

  const fail = (reason: string) =>
    res.redirect(302, `/akun?pemulihan=${reason}`)

  if (!uid || !token) return fail('tidak-lengkap')

  const { data, error } = await supabase.auth.admin.getUserById(uid)
  if (error || !data.user) return fail('tidak-dikenal')

  const meta = (data.user.user_metadata ?? {}) as RecoveryMetadata

  if (!meta.recoveryTokenHash || !meta.recoveryEmail) return fail('tidak-dikenal')
  if (!isTokenAlive(meta.recoveryTokenExpiresAt)) return fail('kedaluwarsa')
  if (!isTokenMatching(token, meta.recoveryTokenHash)) return fail('tidak-cocok')

  const { error: updateError } = await supabase.auth.admin.updateUserById(uid, {
    user_metadata: {
      ...data.user.user_metadata,
      isRecoveryEmailVerified: true,
      recoveryTokenHash: null,
      recoveryTokenExpiresAt: null,
    },
  })

  if (updateError) return fail('gagal')

  return res.redirect(302, '/akun?pemulihan=terkonfirmasi')
}

export default withApi('auth-recovery-confirm', handler)
