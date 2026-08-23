import type { User } from '@supabase/supabase-js'

import {
  getSupabaseAuthSetupMessage,
  getSupabaseBrowser,
} from '@/shared/lib/supabaseBrowser'
import {
  USERNAME_DOMAIN,
  getLoginEmail,
  getUsernameFromEmail,
} from '@/shared/lib/authIdentity'
import type {
  DataAuthSession,
  PayloadPostAuthPassword,
  PayloadPostAuthRegister,
  PayloadPostAuthSession,
} from '../types/authTypes'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

const getMappedSession = (user: User): DataAuthSession => ({
  id: user.id,
  email: user.email ?? '',
  name:
    (user.user_metadata?.username as string) ||
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    getUsernameFromEmail(user.email ?? '') ||
    '',
  avatarUrl:
    (user.user_metadata?.avatar_url as string) ||
    (user.user_metadata?.picture as string) ||
    '',
})

const getClient = () => {
  const client = getSupabaseBrowser()
  if (!client) throw new Error(getSupabaseAuthSetupMessage())
  return client
}

export const getAuthSession = async () => {
  const { data, error } = await getClient().auth.getSession()
  if (error) throw error

  const user = data.session?.user
  return user ? getMappedSession(user) : null
}

export const postAuthSession = async (payload: PayloadPostAuthSession) => {
  const redirectTo = `${window.location.origin}/auth/callback${
    payload.next ? `?next=${encodeURIComponent(payload.next)}` : ''
  }`

  const { error } = await getClient().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (error) throw error

  return null
}

export const postAuthPassword = async (payload: PayloadPostAuthPassword) => {
  const { error } = await getClient().auth.signInWithPassword({
    email: getLoginEmail(payload.username),
    password: payload.password,
  })

  if (error) {
    throw new Error(
      /invalid login credentials/i.test(error.message)
        ? 'Username atau kata sandi salah.'
        : error.message || 'Login gagal. Coba lagi sebentar lagi.'
    )
  }

  return null
}

export const postAuthRegister = async (payload: PayloadPostAuthRegister) => {
  const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(json?.message || res.statusText)

  await postAuthPassword(payload)

  return json
}

export const deleteAuthSession = async () => {
  const { error } = await getClient().auth.signOut()
  if (error) throw error

  return null
}

export const getAuthSessionChanges = (
  onChange: (session: DataAuthSession | null) => void
) => {
  const client = getSupabaseBrowser()
  if (!client) return () => {}

  const { data } = client.auth.onAuthStateChange((_event, session) => {
    onChange(session?.user ? getMappedSession(session.user) : null)
  })

  return () => data.subscription.unsubscribe()
}

export const postAuthForgotPassword = async (email: string) => {
  const value = email.trim().toLowerCase()

  if (value.endsWith(`@${USERNAME_DOMAIN}`)) {
    throw new Error(
      `Alamat @${USERNAME_DOMAIN} dibuat otomatis dari username dan tidak bisa menerima surat. Pemulihan lewat email baru berlaku untuk akun yang masuk dengan Google.`
    )
  }

  const redirectTo = `${window.location.origin}/auth/reset-password`
  const { error } = await getClient().auth.resetPasswordForEmail(value, { redirectTo })
  if (error) throw error
  return null
}

export const postAuthResetPassword = async (newPassword: string) => {
  const { error } = await getClient().auth.updateUser({ password: newPassword })
  if (error) throw error
  return null
}

