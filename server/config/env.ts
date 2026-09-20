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

// Alamat project Supabase (https://xxxx.supabase.co) gampang tertukar dengan
// connection string-nya, dan keduanya memang bersebelahan di dashboard. Yang
// tertukar dibuang di sini supaya sumber berikutnya masih dipakai — kalau tidak,
// satu nilai salah tempel mematikan seluruh aplikasi.
const asDatabaseUrl = (url: string) => {
  if (!url) return ''
  if (/^postgres(ql)?:\/\//.test(url)) return url

  console.warn(
    `[env] nilai "${url.slice(0, 24)}…" bukan connection string PostgreSQL dan diabaikan. ${DATABASE_ENV_HINT}`
  )

  return ''
}

// Sandi dalam connection string kerap masih berupa penanda: [YOUR-PASSWORD]
// dari dashboard Supabase, atau <password> dari contoh yang ditempel apa adanya.
// Bentuk seperti itu tidak mungkin jadi sandi sungguhan, jadi lebih baik diisi
// daripada dikirim ke server dan gagal dengan sebab yang membingungkan.
export const isPasswordPlaceholder = (password: string) =>
  !password ||
  /^[[<{(].*[\]>})]$/.test(password) ||
  ['YOUR-PASSWORD', 'YOUR_PASSWORD', 'PASSWORD', 'SUPABASE_PASSWORD'].includes(
    password.toUpperCase()
  )

// Sandinya diisikan dari SUPABASE_PASSWORD dan di-encode agar karakter seperti
// "@" tidak memotong URL.
const withPassword = (url: string) => {
  if (!url) return ''

  const password = getValue('SUPABASE_PASSWORD')
  const match = url.match(/^(\w+:\/\/[^:@/]+:)([^@]*)(@.*)$/)

  if (!match || !password) return url

  return isPasswordPlaceholder(match[2])
    ? `${match[1]}${encodeURIComponent(password)}${match[3]}`
    : url
}

// Pooler memanggil project dengan ref-nya (20 huruf), bukan nama yang terbaca
// manusia. SUPABASE_PROJECT sering diisi nama, jadi ref-nya dicari juga dari
// alamat project dan dari connection string — keduanya memuat ref yang sama.
const getProjectRef = () => {
  const named = getValue('SUPABASE_PROJECT')
  if (/^[a-z]{16,}$/.test(named)) return named

  const fromHost = [
    getValue('SUPABASE_URL'),
    getValue('NEXT_PUBLIC_SUPABASE_URL'),
    getValue('SUPABASE_DIRECT_CONNECTION_STRING'),
  ]
    .join(' ')
    .match(/(?:\/\/|@)(?:db\.)?([a-z]{16,})\.supabase\.(?:co|com)/)

  return fromHost?.[1] ?? named
}

// Host pooler-lah yang bisa dihubungi dari lingkungan serverless; koneksi
// langsung (db.<ref>.supabase.co) hanya punya alamat IPv6. Port 6543 adalah mode
// transaksi, yang memang dipakai bersama pgbouncer.
//
// Kata sandi Supabase kerap memuat karakter seperti "@" atau "#", yang memotong
// URL kalau ditempel mentah.
const getPoolerUrl = () => {
  const project = getProjectRef()
  const password = getValue('SUPABASE_PASSWORD')
  const host =
    getValue('SUPABASE_POOLER_HOST') ||
    (getValue('SUPABASE_REGION')
      ? `aws-0-${getValue('SUPABASE_REGION')}.pooler.supabase.com`
      : '')

  if (!project || !password || !host) return ''

  const port = getValue('SUPABASE_POOLER_PORT') || '6543'
  const query = port === '6543' ? '?pgbouncer=true&connection_limit=1' : ''

  return `postgresql://postgres.${project}:${encodeURIComponent(password)}@${host}:${port}/postgres${query}`
}

/**
 * Urutannya sengaja: DATABASE_URL yang ditulis sendiri selalu menang, lalu URL
 * pooler kalau wilayahnya diketahui, baru koneksi langsung dari dashboard.
 * Pooler didahulukan karena koneksi langsung tidak terjangkau dari lingkungan
 * serverless yang hanya punya IPv4; untuk migrasi ada getDirectDatabaseUrl.
 */
export const getDatabaseUrl = () =>
  asDatabaseUrl(withPassword(getValue('DATABASE_URL'))) ||
  getPoolerUrl() ||
  asDatabaseUrl(withPassword(getValue('SUPABASE_DIRECT_CONNECTION_STRING')))

// Migrasi tidak bisa lewat pooler; kalau ada connection string langsung, itu
// yang dipakai.
export const getDirectDatabaseUrl = () =>
  asDatabaseUrl(withPassword(getValue('DIRECT_URL'))) ||
  asDatabaseUrl(withPassword(getValue('SUPABASE_DIRECT_CONNECTION_STRING'))) ||
  getDatabaseUrl()

// Dipakai util lain supaya semuanya membaca environment lewat satu jalur yang
// sama, termasuk cadangan dari berkas .env.
export const getEnvValue = (name: keyof typeof ENV) => getValue(name)

export const getSupabaseUrl = () =>
  getValue('SUPABASE_URL') || getValue('NEXT_PUBLIC_SUPABASE_URL')
