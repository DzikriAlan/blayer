import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).trim()

const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim()

const isReady = !!supabaseUrl && !!supabaseKey

const verifier = isReady
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
  : null

export interface AuthUser {
  id: string
  email: string
}

const getBearerToken = (req: NextApiRequest) => {
  const header = req.headers.authorization ?? ''
  if (!header.toLowerCase().startsWith('bearer ')) return ''
  return header.slice(7).trim()
}

export const getAuthUser = async (req: NextApiRequest) => {
  if (!verifier) return null

  const token = getBearerToken(req)
  if (!token) return null

  const { data, error } = await verifier.auth.getUser(token)
  if (error || !data.user) return null

  return { id: data.user.id, email: data.user.email ?? '' } as AuthUser
}

export const getAuthGuard = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (!verifier) {
    res.status(500).json({
      message:
        'Verifikasi sesi belum bisa dijalankan — SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum terbaca di server.',
    })
    return null
  }

  const user = await getAuthUser(req)

  if (!user) {
    res.status(401).json({ message: 'Perlu masuk lebih dulu.' })
    return null
  }

  return user
}
