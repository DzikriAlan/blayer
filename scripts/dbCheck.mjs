#!/usr/bin/env node
/**
 * Pemeriksa alamat basis data.
 *
 * "Pastikan basis datanya hidup" susah dijawab kalau yang terlihat hanya
 * 503 DATABASE_UNAVAILABLE. Skrip ini memisahkan sebab-sebabnya satu per satu:
 * variabel mana yang terbaca, alamat mana yang tersusun darinya, apakah
 * host-nya punya alamat IPv4, dan apakah basis datanya benar-benar menjawab.
 *
 * Kata sandi tidak pernah ikut tercetak, jadi keluarannya aman ditempel ke
 * catatan atau ke percakapan dukungan.
 */

import { createRequire } from 'node:module'
import { Resolver } from 'node:dns/promises'

import {
  DATABASE_ENV_HINT,
  getAppDatabaseUrl,
  getMigrationDatabaseUrl,
  getProjectRef,
  getValue,
  isPasswordPlaceholder,
  loadEnvFiles,
  maskUrl,
} from './lib/databaseUrl.mjs'

const require = createRequire(import.meta.url)

const NAMES = [
  'DATABASE_URL',
  'DIRECT_URL',
  'SUPABASE_DIRECT_CONNECTION_STRING',
  'SUPABASE_URL',
  'SUPABASE_PROJECT',
  'SUPABASE_PASSWORD',
  'SUPABASE_REGION',
  'SUPABASE_POOLER_HOST',
  'SUPABASE_POOLER_PORT',
]

const SECRET_NAMES = new Set(['SUPABASE_PASSWORD'])

// Sebab kegagalan yang berulang, beserta langkah yang benar-benar menutupnya.
const CAUSES = [
  {
    match: /must start with the protocol|invalid port|the provided database string/i,
    tell: 'Nilainya bukan connection string PostgreSQL. Yang dipakai harus yang diawali postgresql://, bukan alamat project https://xxxx.supabase.co.',
  },
  {
    match: /tenant or user not found|tenant\/user/i,
    tell: 'Pooler tidak mengenali penggunanya. SUPABASE_REGION kemungkinan bukan wilayah project ini, atau ref project-nya salah. Wilayah yang benar terbaca di connection string pada dashboard Supabase.',
  },
  {
    match: /password authentication failed|P1000/i,
    tell: 'Kata sandinya ditolak. Isi SUPABASE_PASSWORD dengan kata sandi basis data (Project Settings → Database → Reset database password), bukan API key.',
  },
  {
    match: /getaddrinfo|ENOTFOUND|EAI_AGAIN/i,
    tell: 'Nama host-nya tidak bisa diterjemahkan. Periksa ejaan host pooler atau wilayahnya.',
  },
  {
    match: /ETIMEDOUT|ECONNREFUSED|Can't reach database server|connection timed out/i,
    tell: 'Host-nya tidak menjawab. Kalau ini host koneksi langsung (db.<ref>.supabase.co), dari lingkungan yang hanya ber-IPv4 memang tidak akan pernah terjangkau — pakai host pooler. Kalau project-nya sedang dijeda Supabase, nyalakan dulu dari dashboard.',
  },
  {
    match: /SASL|SCRAM|authentication/i,
    tell: 'Autentikasinya ditolak. Kalau sandinya disalin dari contoh, penandanya (<password>, [YOUR-PASSWORD]) harus diganti sandi sungguhan.',
  },
  {
    match: /prepared statement .* already exists|P2024/i,
    tell: 'Mode transaksi butuh parameter pgbouncer=true&connection_limit=1 pada alamatnya.',
  },
]

const print = (label, value) => console.log(`${label.padEnd(22)} ${value}`)

const getHost = (url) => {
  const match = url.match(/@([^:/?]+)(?::(\d+))?/)
  return { host: match?.[1] ?? '', port: match?.[2] ?? '' }
}

const checkDns = async (host) => {
  const resolver = new Resolver()
  const lookup = async (kind) => {
    try {
      return await resolver[kind === 'A' ? 'resolve4' : 'resolve6'](host)
    } catch {
      return []
    }
  }

  return { ipv4: await lookup('A'), ipv6: await lookup('AAAA') }
}

const checkConnection = async (url) => {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient({ datasources: { db: { url } }, log: [] })
  const startedAt = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`
    const durationMs = Date.now() - startedAt
    const tables = await prisma.$queryRaw`
      SELECT count(*)::int AS total
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `

    return { isReady: true, durationMs, tables: tables?.[0]?.total ?? 0 }
  } catch (error) {
    return { isReady: false, message: String(error?.message ?? error) }
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

loadEnvFiles()

console.log('\nVariabel yang terbaca\n')

for (const name of NAMES) {
  const value = getValue(name)

  if (!value) {
    print(name, '— kosong')
    continue
  }

  print(name, SECRET_NAMES.has(name) ? `terisi (${value.length} karakter)` : maskUrl(value))
}

const rawPassword = (getValue('DATABASE_URL').match(/^\w+:\/\/[^:@/]+:([^@]*)@/) ?? [])[1]

if (rawPassword && isPasswordPlaceholder(rawPassword)) {
  console.log(
    `\n⚠ Sandi pada DATABASE_URL masih berupa penanda. Nilainya diganti dengan\n  SUPABASE_PASSWORD, tapi di platform deploy penandanya harus kamu ganti\n  sendiri dengan sandi sungguhan.`
  )
}

const ignored = []
const appUrl = getAppDatabaseUrl((url) => ignored.push(url))
const migrationUrl = getMigrationDatabaseUrl(() => {})

console.log('\nAlamat yang tersusun\n')

print('ref project', getProjectRef() || '— tidak diketahui')
print('aplikasi', appUrl ? maskUrl(appUrl) : `— tidak ada. ${DATABASE_ENV_HINT}`)
print('migrasi', migrationUrl ? maskUrl(migrationUrl) : '— tidak ada')

for (const url of ignored) {
  console.log(`\n⚠ "${url.slice(0, 40)}…" diabaikan: bukan connection string PostgreSQL.`)
}

if (!appUrl) process.exit(2)

const { host, port } = getHost(appUrl)
const dns = await checkDns(host)

console.log('\nAlamat jaringan\n')

print('host', `${host}:${port}`)
print('IPv4 (A)', dns.ipv4.length ? dns.ipv4.join(', ') : '— tidak ada')
print('IPv6 (AAAA)', dns.ipv6.length ? dns.ipv6.join(', ') : '— tidak ada')

if (!dns.ipv4.length && dns.ipv6.length) {
  console.log(
    '\n⚠ Host ini hanya punya alamat IPv6. Dari Vercel dan lingkungan serverless\n' +
      '  lain yang keluar lewat IPv4, alamat ini tidak akan pernah terjangkau.\n' +
      '  Pakai host pooler: aws-0-<region>.pooler.supabase.com:6543.'
  )
}

console.log('\nJawaban basis data\n')

const result = await checkConnection(appUrl)

if (result.isReady) {
  print('status', `hidup, menjawab dalam ${result.durationMs} ms`)
  print('tabel di public', String(result.tables))
  console.log(
    result.tables > 0
      ? '\n✓ Basis datanya hidup dan skemanya sudah terpasang.\n'
      : '\n⚠ Basis datanya hidup tapi masih kosong. Jalankan `npm run db:deploy`.\n'
  )
  process.exit(0)
}

print('status', 'tidak menjawab')
console.log(`\n${result.message.split('\n').filter(Boolean).slice(-1)[0]}`)

const cause = CAUSES.find((entry) => entry.match.test(result.message))

console.log(`\n→ ${cause?.tell ?? DATABASE_ENV_HINT}\n`)
process.exit(1)
