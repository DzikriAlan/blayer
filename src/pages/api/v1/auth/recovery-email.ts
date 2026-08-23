import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

import { withApi } from '@/shared/lib/apiHandler'
import { sendFailure, sendMethodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { getSiteUrl } from '@/shared/lib/siteUrl'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import { getAuthGuard } from '@/shared/lib/authServer'
import { getSupabaseSetupMessage, isSupabaseReady, supabase } from '@/shared/lib/supabase'
import { USERNAME_DOMAIN } from '@/shared/lib/authIdentity'
import { isMailerReady, getMailerSetupMessage, sendMail } from '@/shared/lib/mailer'
import {
  RECOVERY_TOKEN_TTL_MS,
  createRecoveryToken,
  getRecoveryEmailProblem,
  type RecoveryMetadata,
} from '@/shared/lib/recoveryEmail'

const getConfirmationHtml = (link: string) => `
  <p>Alamat ini didaftarkan sebagai alamat pemulihan akun Blayer.</p>
  <p><a href="${link}">Konfirmasi alamat ini</a></p>
  <p>Tautan berlaku 24 jam. Kalau kamu tidak merasa mendaftarkannya, abaikan
  surat ini — tanpa konfirmasi, alamat ini tidak akan dipakai.</p>
`

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT' && req.method !== 'GET') {
    return sendMethodNotAllowed(res, req.method, ['GET', 'PUT'])
  }

  const user = await getAuthGuard(req, res)
  if (!user) return

  if (!isSupabaseReady || !supabase) {
    return sendFailure(res, {
      status: 503,
      message: getSupabaseSetupMessage(),
      errors: [{ code: 'SERVICE_UNAVAILABLE', field: '', message: getSupabaseSetupMessage() }],
    })
  }

  const { data: account, error: accountError } =
    await supabase.auth.admin.getUserById(user.id)

  if (accountError || !account.user) {
    return sendFailure(res, {
      status: 404,
      message: 'Akun tidak ditemukan.',
      errors: [{ code: 'ACCOUNT_NOT_FOUND', field: '', message: 'Akun tidak ditemukan.' }],
    })
  }

  const meta = (account.user.user_metadata ?? {}) as RecoveryMetadata

  if (req.method === 'GET') {
    return sendSuccess(res, {
      message: 'Status alamat pemulihan berhasil dimuat',
      data: {
        email: meta.recoveryEmail ?? '',
        isVerified: !!meta.isRecoveryEmailVerified,
      },
    })
  }

  if (
    !(await enforceRateLimit(req, res, {
      name: 'recovery-email-set',
      limit: 5,
      windowMs: 60 * 60_000,
      scope: user.id,
    }))
  ) {
    return
  }

  const { email, password } = req.body as { email?: string; password?: string }

  const problem = getRecoveryEmailProblem(email ?? '', USERNAME_DOMAIN)
  if (problem) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'INVALID_EMAIL', field: 'email', message: problem }],
    })
  }

  if (!password) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'PASSWORD_REQUIRED', field: 'password', message: 'Kata sandi saat ini wajib diisi.' }],
    })
  }

  const checker = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim(),
    (
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ''
    ).trim(),
    { auth: { persistSession: false } }
  )

  const { error: passwordError } = await checker.auth.signInWithPassword({
    email: account.user.email ?? '',
    password,
  })

  if (passwordError) {
    return sendFailure(res, {
      status: 403,
      message: 'Kata sandi saat ini salah.',
      errors: [{ code: 'PASSWORD_INCORRECT', field: 'password', message: 'Kata sandi saat ini salah.' }],
    })
  }

  if (!isMailerReady()) {
    return sendFailure(res, {
      status: 503,
      message: getMailerSetupMessage(),
      errors: [{ code: 'MAILER_UNAVAILABLE', field: '', message: getMailerSetupMessage() }],
    })
  }

  const siteUrl = getSiteUrl(req)

  if (!siteUrl) {
    return sendFailure(res, {
      status: 503,
      message: 'Tautan konfirmasi belum bisa dibuat — NEXT_PUBLIC_SITE_URL belum diisi di server.',
      errors: [{ code: 'SITE_URL_MISSING', field: '', message: 'Konfigurasi server belum lengkap.' }],
    })
  }

  const { token, hash } = createRecoveryToken()

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...account.user.user_metadata,
      recoveryEmail: (email ?? '').trim().toLowerCase(),
      isRecoveryEmailVerified: false,
      recoveryTokenHash: hash,
      recoveryTokenExpiresAt: Date.now() + RECOVERY_TOKEN_TTL_MS,
    },
  })

  if (updateError) {
    return sendFailure(res, {
      status: 500,
      message: updateError.message,
      errors: [{ code: 'UPDATE_FAILED', field: '', message: updateError.message }],
    })
  }

  const link = `${siteUrl}/api/v1/auth/recovery-email/confirm?uid=${user.id}&token=${token}`

  const sent = await sendMail({
    to: (email ?? '').trim().toLowerCase(),
    subject: 'Konfirmasi alamat pemulihan Blayer',
    html: getConfirmationHtml(link),
  })

  if (!sent.isSent) {
    return sendFailure(res, {
      status: 502,
      message: `Alamat tersimpan, tetapi surat konfirmasi gagal terkirim: ${sent.error}`,
      errors: [{ code: 'MAIL_SEND_FAILED', field: '', message: sent.error }],
    })
  }

  return sendSuccess(res, {
    message: 'Alamat pemulihan tersimpan, surat konfirmasi terkirim',
    data: { email: (email ?? '').trim().toLowerCase(), isVerified: false },
  })
}

export default withApi('auth-recovery-email', handler)
