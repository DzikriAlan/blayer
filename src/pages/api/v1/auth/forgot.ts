import type { NextApiRequest, NextApiResponse } from 'next'

import { withApi } from '@/shared/lib/apiHandler'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import { getSupabaseSetupMessage, isSupabaseReady, supabase } from '@/shared/lib/supabase'
import { getEmailFromUsername, getUsernameProblem } from '@/shared/lib/authIdentity'
import { isMailerReady, sendMail } from '@/shared/lib/mailer'
import { logger } from '@/shared/lib/logger'
import type { RecoveryMetadata } from '@/shared/lib/recoveryEmail'

/**
 * Jawaban yang sama untuk semua keadaan.
 *
 * Username terdaftar atau tidak, punya alamat pemulihan atau tidak, suratnya
 * terkirim atau gagal — pemanggil menerima kalimat yang sama. Perbedaan sekecil
 * apa pun di sini bisa dipakai untuk memetakan akun mana yang ada.
 */
const SAME_ANSWER = {
  message:
    'Kalau username itu terdaftar dan punya alamat pemulihan yang sudah dikonfirmasi, tautan pemulihan sudah dikirim ke alamat tersebut.',
}

const getBaseUrl = (req: NextApiRequest) => {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim()
  if (configured) return configured.replace(/\/+$/, '')

  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'http'
  return `${proto}://${req.headers.host}`
}

const getRecoveryHtml = (link: string) => `
  <p>Ada permintaan pemulihan kata sandi untuk akun Blayer-mu.</p>
  <p><a href="${link}">Atur kata sandi baru</a></p>
  <p>Kalau bukan kamu yang meminta, abaikan surat ini. Kata sandimu tidak
  berubah sampai tautan itu dibuka.</p>
`

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
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

  // Bentuk username yang jelas keliru tetap ditolak, karena itu tidak
  // membocorkan apa pun tentang akun yang ada.
  const problem = getUsernameProblem(username ?? '')
  if (problem) return res.status(400).json({ message: problem })

  if (!isSupabaseReady || !supabase) {
    return res.status(503).json({ message: getSupabaseSetupMessage() })
  }

  const loginEmail = getEmailFromUsername(username ?? '')

  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) {
    logger.error('pemulihan gagal membaca daftar akun', { errorMessage: error.message })
    return res.status(200).json(SAME_ANSWER)
  }

  const account = data.users.find((item) => item.email === loginEmail)
  const meta = (account?.user_metadata ?? {}) as RecoveryMetadata

  if (!account || !meta.recoveryEmail || !meta.isRecoveryEmailVerified) {
    return res.status(200).json(SAME_ANSWER)
  }

  if (!isMailerReady()) {
    logger.error('pemulihan tidak bisa mengirim surat', {
      alasan: 'RESEND_API_KEY kosong',
    })
    return res.status(200).json(SAME_ANSWER)
  }

  // Tautan dibuat, bukan dikirim, oleh Supabase. Alamat login akun ini sintetis
  // sehingga surat dari Supabase tidak akan pernah sampai; yang mengirim ke
  // alamat pemulihan adalah aplikasi ini sendiri.
  const { data: linkData, error: linkError } =
    await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: loginEmail,
      options: { redirectTo: `${getBaseUrl(req)}/auth/reset-password` },
    })

  if (linkError || !linkData.properties?.action_link) {
    logger.error('pemulihan gagal membuat tautan', {
      errorMessage: linkError?.message ?? 'tautan kosong',
    })
    return res.status(200).json(SAME_ANSWER)
  }

  const sent = await sendMail({
    to: meta.recoveryEmail,
    subject: 'Pemulihan kata sandi Blayer',
    html: getRecoveryHtml(linkData.properties.action_link),
  })

  if (!sent.isSent) {
    logger.error('pemulihan gagal mengirim surat', { errorMessage: sent.error })
  }

  return res.status(200).json(SAME_ANSWER)
}

export default withApi('auth-forgot', handler)
