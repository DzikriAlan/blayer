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

  it('TC-86j mengisi sandi yang masih berupa penanda dari contoh', () => {
    process.env.DATABASE_URL =
      'postgresql://postgres.aomfloxezgbgkazzzsuq:<password>@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres'
    process.env.SUPABASE_PASSWORD = 'sandi-sungguhan'

    expect(getDatabaseUrl()).toContain(':sandi-sungguhan@')
  })

  it('TC-86d tidak menimpa sandi yang memang sudah terisi', () => {
    process.env.SUPABASE_DIRECT_CONNECTION_STRING =
      'postgresql://postgres:sandi-asli@db.abc.supabase.co:5432/postgres'
    process.env.SUPABASE_PASSWORD = 'sandi-lain'

    expect(getDatabaseUrl()).toContain('sandi-asli')
  })

  it('TC-86e menyusun alamat pooler dari project, sandi, dan wilayahnya', () => {
    process.env.SUPABASE_PROJECT = 'aomfloxezgbgkazzzsuq'
    process.env.SUPABASE_PASSWORD = 'sandi@kuat'
    process.env.SUPABASE_REGION = 'ap-northeast-2'

    expect(getDatabaseUrl()).toBe(
      'postgresql://postgres.aomfloxezgbgkazzzsuq:sandi%40kuat@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
    )
  })

  it('TC-86f tidak menebak alamat saat wilayahnya tidak diketahui', () => {
    process.env.SUPABASE_PROJECT = 'aomfloxezgbgkazzzsuq'
    process.env.SUPABASE_PASSWORD = 'sandi'

    expect(getDatabaseUrl()).toBe('')
  })

  it('TC-86k memasang parameter pgbouncer pada alamat mode transaksi', () => {
    process.env.DATABASE_URL =
      'postgresql://postgres.aomfloxezgbgkazzzsuq:sandi@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres'

    // Tanpa parameter ini, prepared statement Prisma bentrok di mode transaksi
    // dan gagal dengan 42P05 hanya saat ada permintaan bersamaan.
    expect(getDatabaseUrl()).toContain('pgbouncer=true')
    expect(getDatabaseUrl()).toContain('connection_limit=1')
  })

  it('TC-86l tidak menimpa parameter yang sudah ditulis sendiri', () => {
    process.env.DATABASE_URL =
      'postgresql://postgres.aomfloxezgbgkazzzsuq:sandi@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5'

    expect(getDatabaseUrl()).toContain('connection_limit=5')
  })

  it('TC-86m membiarkan alamat mode sesi apa adanya', () => {
    process.env.DATABASE_URL =
      'postgresql://postgres:sandi@db.aomfloxezgbgkazzzsuq.supabase.co:5432/postgres'

    expect(getDatabaseUrl()).toBe(
      'postgresql://postgres:sandi@db.aomfloxezgbgkazzzsuq.supabase.co:5432/postgres'
    )
  })

  it('TC-86g mencari ref project dari alamat Supabase saat SUPABASE_PROJECT berisi nama', () => {
    process.env.SUPABASE_PROJECT = 'blayer'
    process.env.SUPABASE_URL = 'https://aomfloxezgbgkazzzsuq.supabase.co'
    process.env.SUPABASE_PASSWORD = 'sandi'
    process.env.SUPABASE_REGION = 'ap-northeast-2'

    expect(getDatabaseUrl()).toContain('postgres.aomfloxezgbgkazzzsuq:')
  })

  it('TC-86h mendahulukan pooler atas koneksi langsung yang hanya ber-IPv6', () => {
    process.env.SUPABASE_DIRECT_CONNECTION_STRING =
      'postgresql://postgres:sandi@db.aomfloxezgbgkazzzsuq.supabase.co:5432/postgres'
    process.env.SUPABASE_PASSWORD = 'sandi'
    process.env.SUPABASE_REGION = 'ap-northeast-2'

    expect(getDatabaseUrl()).toContain('pooler.supabase.com:6543')
  })

  it('TC-86i mengabaikan alamat project yang tertukar dengan connection string', () => {
    process.env.DATABASE_URL = 'https://aomfloxezgbgkazzzsuq.supabase.co'
    process.env.SUPABASE_DIRECT_CONNECTION_STRING =
      'postgresql://postgres:sandi@db.aomfloxezgbgkazzzsuq.supabase.co:5432/postgres'

    expect(getDatabaseUrl()).toBe(
      'postgresql://postgres:sandi@db.aomfloxezgbgkazzzsuq.supabase.co:5432/postgres'
    )
  })
})

describe('alamat Supabase untuk CSP', () => {
  it('TC-87a mendahulukan SUPABASE_URL atas nama lamanya', () => {
    process.env.SUPABASE_URL = 'https://baru.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://lama.supabase.co'

    expect(getSupabaseUrl()).toBe('https://baru.supabase.co')
  })
})
