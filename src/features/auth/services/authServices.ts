import type { User } from '@supabase/supabase-js'

import {
  getSupabaseAuthSetupMessage,
  getSupabaseBrowser,
} from '@/shared/lib/supabaseBrowser'
import { getLoginEmail, getUsernameFromEmail } from '@/shared/lib/authIdentity'
import type {
  DataAuthSession,
  PayloadPostAuthPassword,
  PayloadPostAuthRegister,
  PayloadPostAuthSession,
} from '../types/authTypes'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

/**
 * Metadata Google datang dengan nama field yang berbeda-beda
 * (`full_name`, `name`, `avatar_url`, `picture`), jadi semuanya dirapikan ke
 * satu bentuk supaya komponen tidak perlu tahu asal datanya.
 */
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
  // Google mengembalikan pengguna ke halaman callback, bukan langsung ke
  // tujuan akhir — URL tujuan dititipkan lewat query supaya callback tahu ke
  // mana harus melanjutkan setelah sesi terbaca.
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

  // Supabase menjawab kombinasi salah dengan pesan bahasa Inggris yang menyebut
  // "credentials"; diterjemahkan supaya sejalan dengan sisa antarmuka.
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

  // Mendaftar langsung diikuti masuk supaya pengguna tidak perlu mengetik
  // ulang apa yang baru saja diisinya.
  await postAuthPassword(payload)

  return json
}

export const deleteAuthSession = async () => {
  const { error } = await getClient().auth.signOut()
  if (error) throw error

  return null
}

/**
 * Mendengarkan perubahan sesi dari Supabase.
 *
 * Dibutuhkan karena sesi bisa berubah tanpa aksi di halaman ini — token
 * diperbarui otomatis, atau pengguna logout dari tab lain. Mengembalikan
 * fungsi pembatalan agar listener ikut dibersihkan saat komponen dilepas.
 */
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
  const redirectTo = `${window.location.origin}/auth/reset-password`
  const { error } = await getClient().auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw error
  return null
}

export const postAuthResetPassword = async (newPassword: string) => {
  const { error } = await getClient().auth.updateUser({ password: newPassword })
  if (error) throw error
  return null
}

