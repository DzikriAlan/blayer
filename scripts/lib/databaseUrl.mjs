/**
 * Aturan penyelesaian alamat basis data untuk perkakas baris perintah.
 *
 * Aturannya sengaja disalin dari server/config/env.ts, bukan diimpor: skrip
 * berjalan sebelum ada yang mengompilasi TypeScript. Yang membedakan hanya
 * port — aplikasi memakai mode transaksi (6543), migrasi memakai mode sesi
 * (5432) karena mode transaksi tidak bisa menjalankan migrasi.
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

export const DATABASE_ENV_HINT =
  'Setel DATABASE_URL, atau SUPABASE_DIRECT_CONNECTION_STRING, atau SUPABASE_PASSWORD + SUPABASE_REGION.'

export const loadEnvFiles = () => {
  for (const file of ['.env', '.env.local']) {
    const resolved = path.resolve(file)
    if (!existsSync(resolved)) continue

    for (const line of readFileSync(resolved, 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!match) continue

      const [, key, rawValue] = match
      if (process.env[key]) continue

      process.env[key] = rawValue.replace(/^["']|["']$/g, '')
    }
  }
}

export const getValue = (name) => (process.env[name] ?? '').trim()

// Alamat project Supabase (https://xxxx.supabase.co) gampang tertukar dengan
// connection string-nya. Yang tertukar dibuang supaya sumber berikutnya dipakai.
export const asDatabaseUrl = (url, onIgnored) => {
  if (!url) return ''
  if (/^postgres(ql)?:\/\//.test(url)) return url

  onIgnored?.(url)

  return ''
}

// Sandi dalam connection string kerap masih berupa penanda: [YOUR-PASSWORD]
// dari dashboard Supabase, atau <password> dari contoh yang ditempel apa adanya.
export const isPasswordPlaceholder = (password) =>
  !password ||
  /^[[<{(].*[\]>})]$/.test(password) ||
  ['YOUR-PASSWORD', 'YOUR_PASSWORD', 'PASSWORD', 'SUPABASE_PASSWORD'].includes(
    password.toUpperCase()
  )

// Sandinya diisikan dari SUPABASE_PASSWORD.
export const withPassword = (url) => {
  if (!url) return ''

  const password = getValue('SUPABASE_PASSWORD')
  const match = url.match(/^(\w+:\/\/[^:@/]+:)([^@]*)(@.*)$/)

  if (!match || !password) return url

  return isPasswordPlaceholder(match[2])
    ? `${match[1]}${encodeURIComponent(password)}${match[3]}`
    : url
}

// Pooler memanggil project dengan ref-nya (20 huruf), bukan nama yang terbaca
// manusia. Ref yang sama muncul di alamat project dan di connection string.
export const getProjectRef = () => {
  const named = getValue('SUPABASE_PROJECT')
  if (/^[a-z]{16,}$/.test(named)) return named

  const fromHost = [
    getValue('SUPABASE_URL'),
    getValue('SUPABASE_PROJECT_URL'),
    getValue('NEXT_PUBLIC_SUPABASE_URL'),
    getValue('SUPABASE_DIRECT_CONNECTION_STRING'),
  ]
    .join(' ')
    .match(/(?:\/\/|@)(?:db\.)?([a-z]{16,})\.supabase\.(?:co|com)/)

  return fromHost?.[1] ?? named
}

export const getPoolerHost = () =>
  getValue('SUPABASE_POOLER_HOST') ||
  (getValue('SUPABASE_REGION')
    ? `aws-0-${getValue('SUPABASE_REGION')}.pooler.supabase.com`
    : '')

export const getPoolerUrl = (port) => {
  const project = getProjectRef()
  const password = getValue('SUPABASE_PASSWORD')
  const host = getPoolerHost()

  if (!project || !password || !host) return ''

  const query = port === 6543 ? '?pgbouncer=true&connection_limit=1' : ''

  return `postgresql://postgres.${project}:${encodeURIComponent(password)}@${host}:${port}/postgres${query}`
}

/** Alamat yang dipakai aplikasi: pooler mode transaksi lebih dulu. */
export const getAppDatabaseUrl = (onIgnored) =>
  asDatabaseUrl(withPassword(getValue('DATABASE_URL')), onIgnored) ||
  getPoolerUrl(6543) ||
  asDatabaseUrl(withPassword(getValue('SUPABASE_DIRECT_CONNECTION_STRING')), onIgnored)

/** Alamat yang dipakai migrasi: harus mode sesi, jadi koneksi langsung dulu. */
export const getMigrationDatabaseUrl = (onIgnored) =>
  asDatabaseUrl(withPassword(getValue('DIRECT_URL')), onIgnored) ||
  asDatabaseUrl(withPassword(getValue('SUPABASE_DIRECT_CONNECTION_STRING')), onIgnored) ||
  getPoolerUrl(5432) ||
  asDatabaseUrl(withPassword(getValue('DATABASE_URL')), onIgnored)

/** Menyembunyikan kata sandi supaya alamatnya aman ditampilkan dan disalin. */
export const maskUrl = (url) =>
  url.replace(/^(\w+:\/\/[^:@/]+:)[^@]*(@)/, '$1***$2')
