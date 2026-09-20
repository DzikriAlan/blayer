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

import {
  DATABASE_ENV_HINT,
  getMigrationDatabaseUrl,
  loadEnvFiles,
} from './lib/databaseUrl.mjs'

loadEnvFiles()

const databaseUrl = getMigrationDatabaseUrl((url) => {
  console.warn(
    `[prisma] nilai "${url.slice(0, 24)}…" bukan connection string PostgreSQL dan diabaikan.`
  )
})

if (!databaseUrl) {
  console.error(`Alamat basis data tidak ditemukan. ${DATABASE_ENV_HINT}`)
  process.exit(2)
}

const child = spawn('npx', ['prisma', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: databaseUrl },
})

child.on('exit', (code) => process.exit(code ?? 1))
