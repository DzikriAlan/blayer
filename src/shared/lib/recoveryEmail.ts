import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export const RECOVERY_TOKEN_TTL_MS = 24 * 60 * 60_000

export interface RecoveryMetadata {
  recoveryEmail?: string
  isRecoveryEmailVerified?: boolean
  recoveryTokenHash?: string
  recoveryTokenExpiresAt?: number
}

export const getTokenHash = (token: string) =>
  createHash('sha256').update(token).digest('hex')

export const createRecoveryToken = () => {
  const token = randomBytes(32).toString('hex')
  return { token, hash: getTokenHash(token) }
}

export const isTokenMatching = (token: string, hash: string) => {
  if (!token || !hash) return false

  const given = Buffer.from(getTokenHash(token), 'hex')
  const stored = Buffer.from(hash, 'hex')

  if (given.length !== stored.length) return false
  return timingSafeEqual(given, stored)
}

export const isTokenAlive = (expiresAt: unknown, now = Date.now()) =>
  typeof expiresAt === 'number' && expiresAt > now

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const getRecoveryEmailProblem = (email: string, domain: string) => {
  const value = email.trim().toLowerCase()

  if (!value) return 'Alamat email wajib diisi.'
  if (!EMAIL_PATTERN.test(value)) return 'Alamat email itu belum lengkap.'
  if (value.endsWith(`@${domain}`)) {
    return `Alamat @${domain} dibuat otomatis dari username dan tidak bisa menerima surat. Pakai alamat email yang benar-benar kamu buka.`
  }

  return ''
}
