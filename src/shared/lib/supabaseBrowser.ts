import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Client Supabase khusus sisi browser.
 *
 * Berbeda dari `supabase.ts` yang memakai secret key dan hanya boleh dipanggil
 * dari API route, file ini memakai publishable/anon key sehingga aman ikut
 * terkirim ke browser. Dipakai untuk Supabase Auth — sesi login disimpan di
 * browser dan diperbarui sendiri saat token kedaluwarsa.
 */

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()

// Supabase memakai dua generasi penamaan key publik: anon (lama) dan
// publishable (baru). Keduanya diterima supaya .env yang sudah ada tidak perlu
// ditulis ulang.
const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''
).trim()

export const isSupabaseAuthReady = !!supabaseUrl && !!supabaseAnonKey

/** Menyebut persis env mana yang kurang supaya tidak perlu menebak. */
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

/**
 * Membuat client sekali saja lalu memakai ulang.
 *
 * Tanpa singleton, tiap render bisa membuat client baru yang masing-masing
 * memasang listener token sendiri dan saling menimpa sesi di localStorage.
 */
export const getSupabaseBrowser = () => {
  if (!isSupabaseAuthReady) return null

  client ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Sesi dari redirect Google dibaca sendiri oleh client begitu halaman
      // callback dibuka, jadi tidak perlu tukar kode secara manual.
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })

  return client
}
