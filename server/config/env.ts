import { existsSync, readFileSync } from 'node:fs'

// Sumber kebenaran untuk konfigurasi yang dibaca backend. Project ini memakai
// nama variabel milik Supabase apa adanya, jadi satu set kunci yang sama bisa
// dipakai di lokal maupun di platform deploy tanpa disalin dua kali.

// Next mengganti `process.env` saat build, jadi akses dinamis
// (process.env[nama]) tidak terbaca lagi saat runtime. Tiap variabel karena itu
// disebut namanya satu per satu.
const ENV = {
  DATABASE_URL: () => process.env.DATABASE_URL,
  DIRECT_URL: () => process.env.DIRECT_URL,
  SUPABASE_PROJECT: () => process.env.SUPABASE_PROJECT,
  SUPABASE_PASSWORD: () => process.env.SUPABASE_PASSWORD,
  SUPABASE_URL: () => process.env.SUPABASE_URL,
  SUPABASE_REGION: () => process.env.SUPABASE_REGION,
  SUPABASE_POOLER_HOST: () => process.env.SUPABASE_POOLER_HOST,
  SUPABASE_POOLER_PORT: () => process.env.SUPABASE_POOLER_PORT,
  SUPABASE_DIRECT_CONNECTION_STRING: () => process.env.SUPABASE_DIRECT_CONNECTION_STRING,
  NEXT_PUBLIC_SUPABASE_URL: () => process.env.NEXT_PUBLIC_SUPABASE_URL,
  BLAYER_ENCRYPTION_KEY: () => process.env.BLAYER_ENCRYPTION_KEY,
  BLAYER_ADMIN_USERNAME: () => process.env.BLAYER_ADMIN_USERNAME,
  BLAYER_ADMIN_PASSWORD: () => process.env.BLAYER_ADMIN_PASSWORD,
  BLAYER_SESSION_SECRET: () => process.env.BLAYER_SESSION_SECRET,
  BLAYER_ADMIN_TOKEN: () => process.env.BLAYER_ADMIN_TOKEN,
} as const

// Next hanya menyalurkan sebagian variabel ke proses server produksi, sehingga
// nilai seperti SUPABASE_DIRECT_CONNECTION_STRING bisa hilang di `next start`.
// Berkas .env dibaca sendiri sebagai cadangan; di platform deploy berkasnya
// memang tidak ada dan nilai dari environment tetap yang dipakai.
let fileEnv: Record<string, string> | null = null

const getFileEnv = () => {
  if (fileEnv) return fileEnv

  fileEnv = {}

  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue

    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)

      if (match?.[1] && fileEnv[match[1]] === undefined) {
        fileEnv[match[1]] = (match[2] ?? '').replace(/^["']|["']$/g, '')
      }
    }
  }

  return fileEnv
}

const getValue = (name: keyof typeof ENV) =>
  (ENV[name]() ?? getFileEnv()[name] ?? '').trim()

export const DATABASE_ENV_HINT =
  'Setel DATABASE_URL, atau SUPABASE_DIRECT_CONNECTION_STRING, atau pasangan SUPABASE_PROJECT + SUPABASE_PASSWORD + SUPABASE_REGION.'

// Dashboard Supabase menyalin connection string dengan sandi masih berupa
// penanda [YOUR-PASSWORD]. Kalau begitu bentuknya, sandinya diisikan dari
// SUPABASE_PASSWORD dan di-encode agar karakter seperti "@" tidak memotong URL.
const withPassword = (url: string) => {
  if (!url) return ''

  const password = getValue('SUPABASE_PASSWORD')
  const match = url.match(/^(\w+:\/\/[^:@/]+:)([^@]*)(@.*)$/)

  if (!match || !password) return url

  const [, prefix, current, rest] = match
  const isPlaceholder = !current || /[[\]]/.test(current) || current.toUpperCase() === 'YOUR-PASSWORD'

  return isPlaceholder ? `${prefix}${encodeURIComponent(password)}${rest}` : url
}

// Kata sandi Supabase kerap memuat karakter seperti "@" atau "#", yang memotong
// URL kalau ditempel mentah.
const getPoolerUrl = () => {
  const project = getValue('SUPABASE_PROJECT')
  const password = getValue('SUPABASE_PASSWORD')
  const host =
    getValue('SUPABASE_POOLER_HOST') ||
    (getValue('SUPABASE_REGION')
      ? `aws-0-${getValue('SUPABASE_REGION')}.pooler.supabase.com`
      : '')

  if (!project || !password || !host) return ''

  const port = getValue('SUPABASE_POOLER_PORT') || '5432'

  return `postgresql://postgres.${project}:${encodeURIComponent(password)}@${host}:${port}/postgres`
}

/**
 * Urutannya sengaja: DATABASE_URL yang ditulis sendiri selalu menang, lalu
 * connection string langsung dari dashboard Supabase, baru URL pooler yang
 * disusun dari project dan kata sandinya.
 */
export const getDatabaseUrl = () =>
  withPassword(getValue('DATABASE_URL')) ||
  withPassword(getValue('SUPABASE_DIRECT_CONNECTION_STRING')) ||
  getPoolerUrl()

// Migrasi tidak bisa lewat pooler; kalau ada connection string langsung, itu
// yang dipakai.
export const getDirectDatabaseUrl = () =>
  withPassword(getValue('DIRECT_URL')) ||
  withPassword(getValue('SUPABASE_DIRECT_CONNECTION_STRING')) ||
  getDatabaseUrl()

// Dipakai util lain supaya semuanya membaca environment lewat satu jalur yang
// sama, termasuk cadangan dari berkas .env.
export const getEnvValue = (name: keyof typeof ENV) => getValue(name)

export const getSupabaseUrl = () =>
  getValue('SUPABASE_URL') || getValue('NEXT_PUBLIC_SUPABASE_URL')
