import type { NextApiRequest, NextApiResponse } from 'next'

import { withApi } from '@/shared/lib/apiHandler'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import { getSupabaseSetupMessage, isSupabaseReady, supabase } from '@/shared/lib/supabase'
import {
  isTokenAlive,
  isTokenMatching,
  type RecoveryMetadata,
} from '@/shared/lib/recoveryEmail'

/**
 * Menutup pendaftaran alamat pemulihan.
 *
 * Dibuka dari tautan di surat, jadi jawabannya berupa pengalihan ke halaman
 * akun — bukan JSON, yang akan tampil sebagai teks mentah di peramban.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
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
    return res.status(503).json({ message: getSupabaseSetupMessage() })
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
      // Token dibuang setelah dipakai, supaya tautan yang sama tidak bisa
      // dipakai ulang kalau suratnya bocor di kemudian hari.
      recoveryTokenHash: null,
      recoveryTokenExpiresAt: null,
    },
  })

  if (updateError) return fail('gagal')

  return res.redirect(302, '/akun?pemulihan=terkonfirmasi')
}

export default withApi('auth-recovery-confirm', handler)
