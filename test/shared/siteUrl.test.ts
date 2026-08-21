/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getSiteUrl } from '@/shared/lib/siteUrl'

const getRequest = (host: string, proto?: string) =>
  ({
    headers: { host, ...(proto ? { 'x-forwarded-proto': proto } : {}) },
  }) as never

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('alamat dasar untuk tautan di surat', () => {
  it('TC-53a di produksi header Host tidak dipercaya', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')

    // Kalau ini mengembalikan situs-jahat.test, penyerang cukup meminta
    // pemulihan untuk username korban sambil memalsukan Host: korban menerima
    // surat sah yang tautannya menunjuk ke penyerang.
    expect(getSiteUrl(getRequest('situs-jahat.test', 'https'))).toBe('')
  })

  it('TC-53a yang dipercaya hanya nilai yang dikonfigurasi', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://blayer.app/')

    expect(getSiteUrl(getRequest('situs-jahat.test', 'https'))).toBe(
      'https://blayer.app'
    )
  })

  it('TC-53b di luar produksi Host dipakai supaya pengembangan tidak repot', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')

    expect(getSiteUrl(getRequest('localhost:3002'))).toBe('http://localhost:3002')
  })
})
