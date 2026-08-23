import type { NextApiRequest, NextApiResponse } from 'next'

import { withApi } from '@/shared/lib/apiHandler'
import { sendFailure, sendMethodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import { getSupabaseSetupMessage, isSupabaseReady, supabase } from '@/shared/lib/supabase'
import { getEmailFromUsername, getUsernameProblem } from '@/shared/lib/authIdentity'
import { isMailerReady, sendMail } from '@/shared/lib/mailer'
import { logger } from '@/shared/lib/logger'
import { getSiteUrl } from '@/shared/lib/siteUrl'
import type { RecoveryMetadata } from '@/shared/lib/recoveryEmail'

const SAME_MESSAGE =
  'Kalau username itu terdaftar dan punya alamat pemulihan yang sudah dikonfirmasi, tautan pemulihan sudah dikirim ke alamat tersebut.'

const sendSameAnswer = (res: NextApiResponse) =>
  sendSuccess(res, { message: SAME_MESSAGE, data: null })

const getRecoveryHtml = (link: string) => `
  <p>Ada permintaan pemulihan kata sandi untuk akun Blayer-mu.</p>
  <p><a href="${link}">Atur kata sandi baru</a></p>
  <p>Kalau bukan kamu yang meminta, abaikan surat ini. Kata sandimu tidak
  berubah sampai tautan itu dibuka.</p>
`

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, req.method, ['POST'])
  }

  if (
    !(await enforceRateLimit(req, res, {
      name: 'auth-forgot',
      limit: 5,
      windowMs: 15 * 60_000,
    }))
  ) {
    return
  }

  const { username } = req.body as { username?: string }

  const problem = getUsernameProblem(username ?? '')
  if (problem) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'INVALID_USERNAME_FORMAT', field: 'username', message: problem }],
    })
  }

  if (!isSupabaseReady || !supabase) {
    return sendFailure(res, {
      status: 503,
      message: getSupabaseSetupMessage(),
      errors: [{ code: 'SERVICE_UNAVAILABLE', field: '', message: getSupabaseSetupMessage() }],
    })
  }

  const loginEmail = getEmailFromUsername(username ?? '')

  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) {
    logger.error('pemulihan gagal membaca daftar akun', { errorMessage: error.message })
    return sendSameAnswer(res)
  }

  const account = data.users.find((item) => item.email === loginEmail)
  const meta = (account?.user_metadata ?? {}) as RecoveryMetadata

  if (!account || !meta.recoveryEmail || !meta.isRecoveryEmailVerified) {
    return sendSameAnswer(res)
  }

  if (!isMailerReady()) {
    logger.error('pemulihan tidak bisa mengirim surat', {
      alasan: 'RESEND_API_KEY kosong',
    })
    return sendSameAnswer(res)
  }

  const siteUrl = getSiteUrl(req)

  if (!siteUrl) {
    logger.error('pemulihan dibatalkan', {
      alasan: 'NEXT_PUBLIC_SITE_URL belum diisi di produksi',
    })
    return sendSameAnswer(res)
  }

  const { data: linkData, error: linkError } =
    await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: loginEmail,
      options: { redirectTo: `${siteUrl}/auth/reset-password` },
    })

  if (linkError || !linkData.properties?.action_link) {
    logger.error('pemulihan gagal membuat tautan', {
      errorMessage: linkError?.message ?? 'tautan kosong',
    })
    return sendSameAnswer(res)
  }

  const sent = await sendMail({
    to: meta.recoveryEmail,
    subject: 'Pemulihan kata sandi Blayer',
    html: getRecoveryHtml(linkData.properties.action_link),
  })

  if (!sent.isSent) {
    logger.error('pemulihan gagal mengirim surat', { errorMessage: sent.error })
  }

  return sendSameAnswer(res)
}

export default withApi('auth-forgot', handler)
