import { describe, expect, it } from 'vitest'
import { Prisma } from '@prisma/client'

import { HttpError, handlePrismaError } from '@server/shared/http-error'

const getKnownError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('gagal', {
    code,
    clientVersion: '6.0.0',
  })

describe('penerjemahan error Prisma', () => {
  it('TC-85a menyebut basis data yang tidak bisa dihubungi apa adanya', () => {
    const failure = handlePrismaError(
      new Prisma.PrismaClientInitializationError('gagal konek', '6.0.0'),
      'project'
    )

    expect(failure).toBeInstanceOf(HttpError)
    expect(failure.status).toBe(503)
    expect(failure.code).toBe('DATABASE_UNAVAILABLE')
    expect(failure.message).toContain('DATABASE_URL')
  })

  it('TC-85b memperlakukan kode koneksi Prisma sebagai basis data mati, bukan bug aplikasi', () => {
    ;['P1001', 'P1002', 'P1017'].forEach((code) => {
      const failure = handlePrismaError(getKnownError(code), 'project')

      expect(failure.status).toBe(503)
      expect(failure.code).toBe('DATABASE_UNAVAILABLE')
    })
  })

  it('TC-85c memetakan record yang tidak ada ke 404', () => {
    const failure = handlePrismaError(getKnownError('P2025'), 'project')

    expect(failure.status).toBe(404)
    expect(failure.code).toBe('PROJECT_NOT_FOUND')
  })

  it('TC-85d memetakan bentrok unik ke 409', () => {
    const failure = handlePrismaError(getKnownError('P2002'), 'project')

    expect(failure.status).toBe(409)
    expect(failure.code).toBe('PROJECT_CONFLICT')
  })

  it('TC-85e menyamarkan kegagalan lain sebagai kesalahan server', () => {
    const failure = handlePrismaError(new Error('kolom hilang'), 'project')

    expect(failure.status).toBe(500)
    expect(failure.message).not.toContain('kolom hilang')
  })
})
