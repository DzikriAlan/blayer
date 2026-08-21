import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''
).trim()

export const isSupabaseAuthReady = !!supabaseUrl && !!supabaseAnonKey

export const getSupabaseAuthSetupMessage = () => {
  const missing = [
    supabaseUrl ? '' : 'NEXT_PUBLIC_SUPABASE_URL',
    supabaseAnonKey
      ? ''
      : 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (atau NEXT_PUBLIC_SUPABASE_ANON_KEY)',
  ].filter(Boolean)

  if (!missing.length) return ''

  return `Login belum bisa dipakai — ${missing.join(
    ' dan '
  )} belum terbaca. Isi di .env lalu restart dev server, karena Next.js hanya menanamkan variabel NEXT_PUBLIC_ saat server dinyalakan.`
}

let client: SupabaseClient | null = null

export const getSupabaseBrowser = () => {
  if (!isSupabaseAuthReady) return null

  client ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })

  return client
}
