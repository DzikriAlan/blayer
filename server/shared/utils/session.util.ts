import { createHmac, timingSafeEqual } from 'crypto'

import { isSameToken } from './crypto.util'

export const ADMIN_USERNAME_ENV = 'BLAYER_ADMIN_USERNAME'
export const ADMIN_PASSWORD_ENV = 'BLAYER_ADMIN_PASSWORD'
export const SESSION_SECRET_ENV = 'BLAYER_SESSION_SECRET'
export const ADMIN_TOKEN_ENV = 'BLAYER_ADMIN_TOKEN'

// Instance baru langsung bisa dibuka tanpa menyetel apa pun. Nilai bawaan ini
// sengaja lemah dan hanya untuk memulai — README menyebut penggantiannya sebagai
// langkah wajib sebelum instance dibuka ke luar.
export const DEFAULT_ADMIN_USERNAME = 'admin'
export const DEFAULT_ADMIN_PASSWORD = 'admin123'

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000
const SESSION_PREFIX = 'blas_'

const getEnv = (name: string) => (process.env[name] ?? '').trim()

export const getAdminCredentials = () => {
  const username = getEnv(ADMIN_USERNAME_ENV) || DEFAULT_ADMIN_USERNAME
  const password = getEnv(ADMIN_PASSWORD_ENV) || DEFAULT_ADMIN_PASSWORD

  return {
    username,
    password,
    isDefault:
      username === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD,
  }
}

export const verifyAdminCredentials = (username: string, password: string) => {
  const expected = getAdminCredentials()

  // Keduanya tetap diperiksa walau yang pertama sudah salah, supaya lamanya
  // jawaban tidak memberi tahu bagian mana yang keliru.
  const isSameUsername = isSameToken(username, expected.username)
  const isSamePassword = isSameToken(password, expected.password)

  return isSameUsername && isSamePassword
}

// Kunci penanda tangan sesi: dipisah sebagai env sendiri kalau ada, kalau tidak
// menumpang rahasia yang memang sudah menentukan siapa operatornya.
const getSessionSecret = () =>
  getEnv(SESSION_SECRET_ENV) ||
  getEnv(ADMIN_TOKEN_ENV) ||
  getAdminCredentials().password

const getSignature = (payload: string) =>
  createHmac('sha256', getSessionSecret()).update(payload).digest('hex')

export interface AdminSession {
  token: string
  username: string
  expiresAt: string
}

export const createAdminSession = (username: string): AdminSession => {
  const expiresAtMs = Date.now() + SESSION_TTL_MS
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: expiresAtMs })
  ).toString('base64url')

  return {
    token: `${SESSION_PREFIX}${payload}.${getSignature(payload)}`,
    username,
    expiresAt: new Date(expiresAtMs).toISOString(),
  }
}

export const isAdminSessionToken = (token: string) =>
  token.startsWith(SESSION_PREFIX)

// Sesi tidak disimpan di basis data: isinya ditandatangani, jadi keasliannya
// bisa diperiksa tanpa query — dan mengganti kunci penanda tangan otomatis
// membatalkan semua sesi yang beredar.
export const isValidAdminSession = (token: string) => {
  if (!isAdminSessionToken(token)) return false

  const [payload, signature] = token.slice(SESSION_PREFIX.length).split('.')
  if (!payload || !signature) return false

  const expected = getSignature(payload)

  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return false
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    ) as { u?: unknown; exp?: unknown }

    return typeof parsed.exp === 'number' && parsed.exp > Date.now()
  } catch {
    return false
  }
}

export const isAdminToken = (token: string) => {
  if (!token) return false
  if (isAdminSessionToken(token)) return isValidAdminSession(token)

  // Token mentah tetap diterima supaya skrip, CI, dan curl tidak perlu login
  // lebih dulu.
  const adminToken = getEnv(ADMIN_TOKEN_ENV)

  return !!adminToken && isSameToken(token, adminToken)
}
