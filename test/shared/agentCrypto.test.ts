import { beforeEach, describe, expect, it } from 'vitest'

import {
  createApiKeyToken,
  decryptSecret,
  encryptSecret,
  getEncryptionKey,
  getSecretHint,
  hashToken,
  isSameToken,
} from '@/server/shared/utils/crypto.util'

const KEY = Buffer.alloc(32, 7).toString('base64')
const OTHER_KEY = Buffer.alloc(32, 9).toString('base64')

beforeEach(() => {
  process.env.BLAYER_ENCRYPTION_KEY = KEY
})

describe('penyimpanan kredensial provider', () => {
  it('TC-50a mengembalikan kunci provider apa adanya setelah dibuka kembali', () => {
    const packed = encryptSecret('sk-ant-rahasia')

    expect(packed).not.toBeNull()
    expect(packed).not.toContain('sk-ant-rahasia')
    expect(decryptSecret(packed as string)).toBe('sk-ant-rahasia')
  })

  it('TC-50b menghasilkan cipher berbeda untuk isi yang sama', () => {
    expect(encryptSecret('sk-ant-rahasia')).not.toBe(encryptSecret('sk-ant-rahasia'))
  })

  it('TC-50c menolak membuka cipher dengan kunci lain', () => {
    const packed = encryptSecret('sk-ant-rahasia') as string

    process.env.BLAYER_ENCRYPTION_KEY = OTHER_KEY

    expect(decryptSecret(packed)).toBeNull()
  })

  it('TC-50d menolak cipher yang sudah diubah', () => {
    const packed = encryptSecret('sk-ant-rahasia') as string
    const [iv, tag, data] = packed.split('.')

    const tampered = Buffer.from(data, 'base64')
    tampered[0] ^= 0xff

    expect(
      decryptSecret([iv, tag, tampered.toString('base64')].join('.'))
    ).toBeNull()
    expect(decryptSecret('bukan-cipher')).toBeNull()
  })

  it('TC-50e menolak bekerja tanpa kunci enkripsi yang benar', () => {
    delete process.env.BLAYER_ENCRYPTION_KEY
    expect(getEncryptionKey()).toBeNull()
    expect(encryptSecret('sk-ant-rahasia')).toBeNull()

    process.env.BLAYER_ENCRYPTION_KEY = Buffer.alloc(16, 1).toString('base64')
    expect(getEncryptionKey()).toBeNull()
  })

  it('TC-50f hanya menyisakan empat karakter terakhir sebagai petunjuk', () => {
    expect(getSecretHint('sk-ant-abcd1234')).toBe('****1234')
    expect(getSecretHint('abc')).toBe('****')
  })
})

describe('token API key project', () => {
  it('TC-51a menyimpan hash, bukan tokennya', () => {
    const created = createApiKeyToken()

    expect(created.token.startsWith('blr_')).toBe(true)
    expect(created.prefix).toBe(created.token.slice(0, 12))
    expect(created.hash).toBe(hashToken(created.token))
    expect(created.hash).not.toContain(created.token)
  })

  it('TC-51b tidak pernah menerbitkan token yang sama dua kali', () => {
    const tokens = new Set(
      Array.from({ length: 50 }, () => createApiKeyToken().token)
    )

    expect(tokens.size).toBe(50)
  })

  it('TC-51c membandingkan token tanpa membocorkan panjangnya', () => {
    expect(isSameToken('rahasia', 'rahasia')).toBe(true)
    expect(isSameToken('rahasia', 'rahasia-lain')).toBe(false)
  })
})
