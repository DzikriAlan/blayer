#!/usr/bin/env node
/**
 * Pembungkus perintah Prisma.
 *
 * Prisma CLI hanya membaca DATABASE_URL, sementara project ini menyimpan
 * alamat basis datanya dengan nama variabel milik Supabase. Skrip ini
 * menyelesaikan alamat itu lebih dulu, lalu menjalankan perintah Prisma apa
 * adanya — sehingga `npm run db:deploy` bekerja tanpa menyalin nilai yang sama
 * ke dua nama variabel.
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

// Migrasi harus lewat koneksi langsung, bukan pooler.
const databaseUrl =
  withPassword(getValue('DATABASE_URL')) ||
  withPassword(getValue('SUPABASE_DIRECT_CONNECTION_STRING')) ||
  getPoolerUrl()

if (!databaseUrl) {
  console.error(
    'Alamat basis data tidak ditemukan. Setel DATABASE_URL, atau SUPABASE_DIRECT_CONNECTION_STRING, atau SUPABASE_PROJECT + SUPABASE_PASSWORD + SUPABASE_REGION.'
  )
  process.exit(2)
}

const child = spawn('npx', ['prisma', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: databaseUrl },
})

child.on('exit', (code) => process.exit(code ?? 1))
