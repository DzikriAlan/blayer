import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).trim()

const supabaseServiceKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  ''
).trim()

export const SUPABASE_BANNER_BUCKET =
  process.env.SUPABASE_BANNER_BUCKET?.trim() || 'form-banners'

const getKeyProblem = () => {
  if (!supabaseServiceKey) return ''

  if (supabaseServiceKey.startsWith('sb_secret_')) return ''

  if (supabaseServiceKey.startsWith('sb_publishable_')) {
    return 'Key yang terisi adalah publishable key (sb_publishable_…) yang tidak punya izin menulis ke Storage. Ambil Secret key (sb_secret_…) di Settings → API Keys.'
  }

  const isJwtShaped =
    supabaseServiceKey.startsWith('eyJ') &&
    supabaseServiceKey.split('.').length === 3

  if (isJwtShaped) return ''

  return `Key tidak berbentuk secret key (sb_secret_…) maupun JWT service_role (eyJ… dengan tiga bagian). Panjang yang terbaca ${supabaseServiceKey.length} karakter — biasanya nilainya kepotong atau ikut terbawa spasi/baris baru saat disalin.`
}

export const isSupabaseReady =
  !!supabaseUrl && !!supabaseServiceKey && !getKeyProblem()

export const getSupabaseSetupMessage = () => {
  const missing = [
    supabaseUrl ? '' : 'SUPABASE_URL',
    supabaseServiceKey ? '' : 'SUPABASE_SERVICE_ROLE_KEY (atau SUPABASE_SECRET_KEY)',
  ].filter(Boolean)

  if (missing.length) {
    return `Supabase Storage belum siap — ${missing.join(
      ' dan '
    )} belum terbaca. Isi di .env lalu restart dev server, karena Next.js hanya membaca .env saat server dinyalakan.`
  }

  const problem = getKeyProblem()
  if (problem) return `Supabase Storage belum siap — ${problem}`

  return ''
}

export const supabase = isSupabaseReady
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null
