#!/usr/bin/env node
/**
 * Pembungkus perintah Prisma.
 *
 * Prisma CLI hanya membaca DATABASE_URL, sementara project ini menyimpan
 * alamat basis datanya dengan nama variabel milik Supabase. Skrip ini
 * menyelesaikan alamat itu lebih dulu, lalu menjalankan perintah Prisma apa
 * adanya — sehingga `npm run db:deploy` bekerja tanpa menyalin nilai yang sama
 * ke dua nama variabel.
 *
 * Aturannya sengaja disalin dari server/config/env.ts, bukan diimpor: skrip ini
 * berjalan sebelum ada yang mengompilasi TypeScript. Bedanya satu — migrasi
 * butuh mode sesi (port 5432), sementara aplikasi memakai mode transaksi.
 */

import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const loadEnvFile = (file) => {
  if (!existsSync(file)) return

  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match) continue

    const [, key, rawValue] = match
    if (process.env[key]) continue

    process.env[key] = rawValue.replace(/^["']|["']$/g, '')
  }
}

loadEnvFile(path.resolve('.env'))
loadEnvFile(path.resolve('.env.local'))

const getValue = (name) => (process.env[name] ?? '').trim()

const HINT =
  'Setel DATABASE_URL, atau SUPABASE_DIRECT_CONNECTION_STRING, atau SUPABASE_PROJECT + SUPABASE_PASSWORD + SUPABASE_REGION.'

// Alamat project Supabase (https://xxxx.supabase.co) gampang tertukar dengan
// connection string-nya. Yang tertukar dibuang supaya sumber berikutnya dipakai.
const asDatabaseUrl = (url) => {
  if (!url) return ''
  if (/^postgres(ql)?:\/\//.test(url)) return url

  console.warn(`[prisma] nilai "${url.slice(0, 24)}…" bukan connection string PostgreSQL dan diabaikan.`)

  return ''
}

// Dashboard Supabase menyalin connection string dengan sandi masih berupa
// penanda [YOUR-PASSWORD]; sandinya diisikan dari SUPABASE_PASSWORD.
const withPassword = (url) => {
  if (!url) return ''

  const password = getValue('SUPABASE_PASSWORD')
  const match = url.match(/^(\w+:\/\/[^:@/]+:)([^@]*)(@.*)$/)

  if (!match || !password) return url

  const [, prefix, current, rest] = match
  const isPlaceholder =
    !current || /[[\]]/.test(current) || current.toUpperCase() === 'YOUR-PASSWORD'

  return isPlaceholder ? `${prefix}${encodeURIComponent(password)}${rest}` : url
}

// Pooler memanggil project dengan ref-nya, bukan nama yang terbaca manusia.
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

const getPoolerUrl = () => {
  const project = getProjectRef()
  const password = getValue('SUPABASE_PASSWORD')
  const host =
    getValue('SUPABASE_POOLER_HOST') ||
    (getValue('SUPABASE_REGION')
      ? `aws-0-${getValue('SUPABASE_REGION')}.pooler.supabase.com`
      : '')

  if (!project || !password || !host) return ''

  // Port 5432 pada pooler adalah mode sesi, satu-satunya yang bisa menjalankan
  // migrasi; SUPABASE_POOLER_PORT sengaja tidak dipakai di sini.
  return `postgresql://postgres.${project}:${encodeURIComponent(password)}@${host}:5432/postgres`
}

// Migrasi butuh mode sesi: koneksi langsung lebih dulu, lalu pooler di port
// 5432. Mode transaksi (6543) tidak bisa menjalankan migrasi.
const databaseUrl =
  asDatabaseUrl(withPassword(getValue('DIRECT_URL'))) ||
  asDatabaseUrl(withPassword(getValue('SUPABASE_DIRECT_CONNECTION_STRING'))) ||
  getPoolerUrl() ||
  asDatabaseUrl(withPassword(getValue('DATABASE_URL')))

if (!databaseUrl) {
  console.error(`Alamat basis data tidak ditemukan. ${HINT}`)
  process.exit(2)
}

const child = spawn('npx', ['prisma', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: databaseUrl },
})

child.on('exit', (code) => process.exit(code ?? 1))
