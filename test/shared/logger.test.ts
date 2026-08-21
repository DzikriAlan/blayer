import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { logger, resetAlertSilence } from '@/shared/lib/logger'

const originalFetch = globalThis.fetch
const sent: { body: string }[] = []

beforeEach(() => {
  sent.length = 0
  resetAlertSilence()
  process.env.ALERT_WEBHOOK_URL = 'https://contoh.test/hook'

  globalThis.fetch = vi.fn(async (_url, init) => {
    sent.push({ body: String((init as RequestInit).body) })
    return { ok: true } as Response
  }) as typeof fetch

  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  globalThis.fetch = originalFetch
  delete process.env.ALERT_WEBHOOK_URL
  vi.restoreAllMocks()
})

describe('alert kegagalan', () => {
  it('TC-45a hanya terkirim kalau webhook memang dikonfigurasi', () => {
    delete process.env.ALERT_WEBHOOK_URL

    logger.error('basis data tidak terjangkau', { route: 'forms' })

    expect(sent).toHaveLength(0)
  })

  it('TC-45a data yang menunjuk orang tidak ikut keluar', () => {
    logger.error('gagal menyimpan jawaban', {
      route: 'responses',
      ip: '203.0.113.9',
      email: 'orang@contoh.test',
      errorMessage: 'timeout',
    })

    expect(sent).toHaveLength(1)
    expect(sent[0].body).not.toContain('203.0.113.9')
    expect(sent[0].body).not.toContain('orang@contoh.test')
    expect(sent[0].body).toContain('[disaring]')
    expect(sent[0].body).toContain('timeout')
  })

  it('TC-45b insiden yang sama tidak membanjiri kanal alert', () => {
    for (let index = 0; index < 50; index += 1) {
      logger.error('basis data tidak terjangkau', { attempt: index })
    }

    expect(sent).toHaveLength(1)
  })

  it('TC-45b kegagalan berbeda tetap masing-masing terkirim', () => {
    logger.error('basis data tidak terjangkau')
    logger.error('penyimpanan rate limit tidak terjangkau')

    expect(sent).toHaveLength(2)
  })

  it('TC-45c webhook yang gagal tidak memicu alert lagi', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('jaringan mati')
    }) as typeof fetch

    logger.error('basis data tidak terjangkau')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(console.warn).toHaveBeenCalled()
  })
})
