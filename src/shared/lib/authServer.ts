import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { sendFailure } from './apiResponse'

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

interface CachedUser {
  user: AuthUser
  expiresAt: number
}

const sessionCache = new Map<string, CachedUser>()
const CACHE_TTL_MS = 60_000
const MAX_CACHE_SIZE = 1000

export const clearSessionCache = () => {
  sessionCache.clear()
}

export const getAuthUser = async (req: NextApiRequest) => {
  if (!verifier) return null

  const token = getBearerToken(req)
  if (!token) return null

  const now = Date.now()
  const cached = sessionCache.get(token)
  if (cached && cached.expiresAt > now) {
    return cached.user
  }

  const { data, error } = await verifier.auth.getUser(token)
  if (error || !data.user) {
    sessionCache.delete(token)
    return null
  }

  const user = { id: data.user.id, email: data.user.email ?? '' } as AuthUser

  if (sessionCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = sessionCache.keys().next().value
    if (oldestKey) sessionCache.delete(oldestKey)
  }

  sessionCache.set(token, { user, expiresAt: now + CACHE_TTL_MS })
  return user
}

export const getAuthGuard = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (!verifier) {
    sendFailure(res, {
      status: 500,
      message:
        'Verifikasi sesi belum bisa dijalankan — SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum terbaca di server.',
      errors: [{ code: 'AUTH_UNAVAILABLE', field: '', message: 'Konfigurasi server belum lengkap.' }],
    })
    return null
  }

  const user = await getAuthUser(req)

  if (!user) {
    sendFailure(res, {
      status: 401,
      message: 'Perlu masuk lebih dulu.',
      errors: [{ code: 'UNAUTHENTICATED', field: '', message: 'Sesi tidak ditemukan atau sudah kedaluwarsa.' }],
    })
    return null
  }

  return user
}
