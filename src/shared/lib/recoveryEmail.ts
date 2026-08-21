import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * Alamat pemulihan, terpisah dari alamat login.
 *
 * Alamat login akun username berbentuk `username@blayer.id` dan tidak pernah
 * bisa menerima surat. Menggantinya dengan alamat asli akan memutus login,
 * karena username dipetakan ke alamat itu setiap kali orang masuk. Jadi alamat
 * asli disimpan sebagai keterangan tambahan pada akun, dan hanya dipakai
 * sebagai tujuan pengiriman tautan pemulihan.
 */

export const RECOVERY_TOKEN_TTL_MS = 24 * 60 * 60_000

export interface RecoveryMetadata {
  recoveryEmail?: string
  isRecoveryEmailVerified?: boolean
  recoveryTokenHash?: string
  recoveryTokenExpiresAt?: number
}

/**
 * Token disimpan sebagai hash, bukan apa adanya.
 *
 * Isi `user_metadata` ikut terbaca oleh sesi milik pengguna itu sendiri, dan
 * token mentah di sana berarti siapa pun yang sempat membaca metadata bisa
 * memakai ulang tautannya.
 */
export const getTokenHash = (token: string) =>
  createHash('sha256').update(token).digest('hex')

export const createRecoveryToken = () => {
  const token = randomBytes(32).toString('hex')
  return { token, hash: getTokenHash(token) }
}

/** Pembandingan waktu tetap, supaya lamanya tidak membocorkan isi token. */
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

/**
 * Mengembalikan alasan penolakan, atau string kosong bila alamatnya sah.
 *
 * Domain internal ditolak: alamat itu dibuat otomatis dari username dan tidak
 * pernah bisa menerima surat, jadi menyimpannya sebagai alamat pemulihan hanya
 * menghasilkan janji yang tidak bisa ditepati.
 */
export const getRecoveryEmailProblem = (email: string, domain: string) => {
  const value = email.trim().toLowerCase()

  if (!value) return 'Alamat email wajib diisi.'
  if (!EMAIL_PATTERN.test(value)) return 'Alamat email itu belum lengkap.'
  if (value.endsWith(`@${domain}`)) {
    return `Alamat @${domain} dibuat otomatis dari username dan tidak bisa menerima surat. Pakai alamat email yang benar-benar kamu buka.`
  }

  return ''
}
