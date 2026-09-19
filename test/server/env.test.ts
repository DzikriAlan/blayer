import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getDatabaseUrl, getSupabaseUrl } from '@server/config/env'

const KEYS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'SUPABASE_PROJECT',
  'SUPABASE_PASSWORD',
  'SUPABASE_REGION',
  'SUPABASE_POOLER_HOST',
  'SUPABASE_DIRECT_CONNECTION_STRING',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
] as const

const original: Record<string, string | undefined> = {}

beforeEach(() => {
  KEYS.forEach((key) => {
    original[key] = process.env[key]
    delete process.env[key]
  })
})

afterEach(() => {
  KEYS.forEach((key) => {
    if (original[key] === undefined) delete process.env[key]
    else process.env[key] = original[key]
  })
})

describe('alamat basis data', () => {
  it('TC-86a memakai DATABASE_URL lebih dulu kalau ditulis sendiri', () => {
    process.env.DATABASE_URL = 'postgresql://a:b@localhost:5432/blayer'
    process.env.SUPABASE_DIRECT_CONNECTION_STRING =
      'postgresql://postgres:x@db.abc.supabase.co:5432/postgres'

    expect(getDatabaseUrl()).toBe('postgresql://a:b@localhost:5432/blayer')
  })

  it('TC-86b memakai connection string Supabase saat DATABASE_URL tidak ada', () => {
    process.env.SUPABASE_DIRECT_CONNECTION_STRING =
      'postgresql://postgres:rahasia@db.abc.supabase.co:5432/postgres'

    expect(getDatabaseUrl()).toBe(
      'postgresql://postgres:rahasia@db.abc.supabase.co:5432/postgres'
    )
  })

  it('TC-86c mengisi sandi yang masih berupa penanda [YOUR-PASSWORD]', () => {
    process.env.SUPABASE_DIRECT_CONNECTION_STRING =
      'postgresql://postgres:[YOUR-PASSWORD]@db.abc.supabase.co:5432/postgres'
    process.env.SUPABASE_PASSWORD = 'sandi rahasia'

    expect(getDatabaseUrl()).toBe(
      'postgresql://postgres:sandi%20rahasia@db.abc.supabase.co:5432/postgres'
    )
  })

  it('TC-86d tidak menimpa sandi yang memang sudah terisi', () => {
    process.env.SUPABASE_DIRECT_CONNECTION_STRING =
      'postgresql://postgres:sandi-asli@db.abc.supabase.co:5432/postgres'
    process.env.SUPABASE_PASSWORD = 'sandi-lain'

    expect(getDatabaseUrl()).toContain('sandi-asli')
  })

  it('TC-86e menyusun alamat pooler dari project, sandi, dan wilayahnya', () => {
    process.env.SUPABASE_PROJECT = 'abcdef'
    process.env.SUPABASE_PASSWORD = 'sandi@kuat'
    process.env.SUPABASE_REGION = 'ap-southeast-1'

    expect(getDatabaseUrl()).toBe(
      'postgresql://postgres.abcdef:sandi%40kuat@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
    )
  })

  it('TC-86f tidak menebak alamat saat wilayahnya tidak diketahui', () => {
    process.env.SUPABASE_PROJECT = 'abcdef'
    process.env.SUPABASE_PASSWORD = 'sandi'

    expect(getDatabaseUrl()).toBe('')
  })
})

describe('alamat Supabase untuk CSP', () => {
  it('TC-87a mendahulukan SUPABASE_URL atas nama lamanya', () => {
    process.env.SUPABASE_URL = 'https://baru.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://lama.supabase.co'

    expect(getSupabaseUrl()).toBe('https://baru.supabase.co')
  })
})
