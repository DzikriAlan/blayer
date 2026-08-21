import { Resend } from 'resend'
import { logger } from './logger'

const getApiKey = () => (process.env.RESEND_API_KEY ?? '').trim()

const getFrom = () =>
  (process.env.MAIL_FROM ?? '').trim() || 'onboarding@resend.dev'

export const isMailerReady = () => !!getApiKey()

export const getMailerSetupMessage = () =>
  isMailerReady()
    ? ''
    : 'Pengiriman surat belum aktif — RESEND_API_KEY belum terbaca di server.'

let client: Resend | null = null

const getClient = () => {
  const key = getApiKey()
  if (!key) return null

  client ??= new Resend(key)
  return client
}

interface MailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendMail = async ({ to, subject, html, text }: MailPayload) => {
  const resend = getClient()

  if (!resend) {
    logger.warn('surat tidak terkirim', { alasan: 'RESEND_API_KEY kosong', subject })
    return { isSent: false, id: '', error: getMailerSetupMessage() }
  }

  const { data, error } = await resend.emails.send({
    from: getFrom(),
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  })

  if (error) {
    // Alamat tujuan tidak ikut dicatat: log ini bisa berakhir di agregator
    // pihak ketiga, dan alamat surat menunjuk orang.
    logger.error('pengiriman surat gagal', {
      subject,
      errorMessage: error.message,
    })
    return { isSent: false, id: '', error: error.message }
  }

  return { isSent: true, id: data?.id ?? '', error: '' }
}
