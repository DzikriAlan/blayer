import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'crypto'

import { getEnvValue } from '@server/config/env'

// Kredensial provider AI disimpan di instance milik pengguna sendiri (PRD §4),
// jadi yang masuk basis data adalah cipher-nya, bukan kuncinya. Kunci pembuka
// hidup di env dan tidak pernah ikut tersimpan bersama datanya.
const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12
const KEY_BYTES = 32

export const ENCRYPTION_KEY_ENV = 'BLAYER_ENCRYPTION_KEY'

export const getEncryptionKey = () => {
  const raw = getEnvValue('BLAYER_ENCRYPTION_KEY')
  if (!raw) return null

  const key = Buffer.from(raw, 'base64')
  return key.length === KEY_BYTES ? key : null
}

export const encryptSecret = (plain: string) => {
  const key = getEncryptionKey()
  if (!key) return null

  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])

  return [
    iv.toString('base64'),
    cipher.getAuthTag().toString('base64'),
    encrypted.toString('base64'),
  ].join('.')
}

export const decryptSecret = (packed: string) => {
  const key = getEncryptionKey()
  if (!key) return null

  const [ivPart, tagPart, dataPart] = packed.split('.')
  if (!ivPart || !tagPart || !dataPart) return null

  try {
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivPart, 'base64'))
    decipher.setAuthTag(Buffer.from(tagPart, 'base64'))

    return Buffer.concat([
      decipher.update(Buffer.from(dataPart, 'base64')),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    return null
  }
}

export const getSecretHint = (plain: string) =>
  plain.length <= 4 ? '****' : `****${plain.slice(-4)}`

export const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex')

export const isSameToken = (left: string, right: string) => {
  const leftHash = createHash('sha256').update(left).digest()
  const rightHash = createHash('sha256').update(right).digest()

  return timingSafeEqual(leftHash, rightHash)
}

export interface CreatedApiKey {
  token: string
  prefix: string
  hash: string
}

// Token hanya utuh sekali, saat dibuat. Yang tersimpan cuma hash dan prefix,
// sehingga kebocoran basis data tidak ikut membocorkan kunci pemanggilnya.
export const createApiKeyToken = (): CreatedApiKey => {
  const token = `blr_${randomBytes(24).toString('base64url')}`

  return { token, prefix: token.slice(0, 12), hash: hashToken(token) }
}
