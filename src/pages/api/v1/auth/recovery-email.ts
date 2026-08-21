import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

import { withApi } from '@/shared/lib/apiHandler'
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

const getBaseUrl = (req: NextApiRequest) => {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim()
  if (configured) return configured.replace(/\/+$/, '')

  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'http'
  return `${proto}://${req.headers.host}`
}

const getConfirmationHtml = (link: string) => `
  <p>Alamat ini didaftarkan sebagai alamat pemulihan akun Blayer.</p>
  <p><a href="${link}">Konfirmasi alamat ini</a></p>
  <p>Tautan berlaku 24 jam. Kalau kamu tidak merasa mendaftarkannya, abaikan
  surat ini — tanpa konfirmasi, alamat ini tidak akan dipakai.</p>
`

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT' && req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'PUT'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  const user = await getAuthGuard(req, res)
  if (!user) return

  if (!isSupabaseReady || !supabase) {
    return res.status(503).json({ message: getSupabaseSetupMessage() })
  }

  const { data: account, error: accountError } =
    await supabase.auth.admin.getUserById(user.id)

  if (accountError || !account.user) {
    return res.status(404).json({ message: 'Akun tidak ditemukan.' })
  }

  const meta = (account.user.user_metadata ?? {}) as RecoveryMetadata

  if (req.method === 'GET') {
    return res.status(200).json({
      recoveryEmail: meta.recoveryEmail ?? '',
      isVerified: !!meta.isRecoveryEmailVerified,
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
  if (problem) return res.status(400).json({ message: problem })

  if (!password) {
    return res.status(400).json({ message: 'Kata sandi saat ini wajib diisi.' })
  }

  // Kata sandi diminta ulang di sini, bukan sekadar sesi yang sah. Sesi yang
  // sempat dipakai orang lain — perangkat yang tertinggal terbuka — bisa
  // memindahkan alamat pemulihan ke alamat penyerang dan menjadikan
  // pengambilalihannya permanen.
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
    return res.status(403).json({ message: 'Kata sandi saat ini salah.' })
  }

  if (!isMailerReady()) {
    return res.status(503).json({ message: getMailerSetupMessage() })
  }

  const { token, hash } = createRecoveryToken()

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...account.user.user_metadata,
      recoveryEmail: (email ?? '').trim().toLowerCase(),
      // Belum terbukti bisa dibuka sampai tautannya diklik. Alamat yang salah
      // ketik akan tampak tersimpan padahal tidak akan pernah menerima apa pun.
      isRecoveryEmailVerified: false,
      recoveryTokenHash: hash,
      recoveryTokenExpiresAt: Date.now() + RECOVERY_TOKEN_TTL_MS,
    },
  })

  if (updateError) {
    return res.status(500).json({ message: updateError.message })
  }

  const link = `${getBaseUrl(req)}/api/v1/auth/recovery-email/confirm?uid=${
    user.id
  }&token=${token}`

  const sent = await sendMail({
    to: (email ?? '').trim().toLowerCase(),
    subject: 'Konfirmasi alamat pemulihan Blayer',
    html: getConfirmationHtml(link),
  })

  if (!sent.isSent) {
    return res.status(502).json({
      message: `Alamat tersimpan, tetapi surat konfirmasi gagal terkirim: ${sent.error}`,
    })
  }

  return res.status(200).json({
    recoveryEmail: (email ?? '').trim().toLowerCase(),
    isVerified: false,
  })
}

export default withApi('auth-recovery-email', handler)
