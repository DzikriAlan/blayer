import type { NextApiRequest } from 'next'

export const getSiteUrl = (req: NextApiRequest) => {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim()
  if (configured) return configured.replace(/\/+$/, '')

  if (process.env.NODE_ENV === 'production') return ''

  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'http'
  return `${proto}://${req.headers.host}`
}
