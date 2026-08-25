import { describe, expect, it, vi } from 'vitest'

import { SLOW_REQUEST_MS, withApi } from '@/shared/lib/apiHandler'

const getResponse = () => {
  const res = {
    statusCode: 0,
    body: null as { message?: string } | null,
    headersSent: false,
    headers: {} as Record<string, string>,
    setHeader(key: string, value: string) {
      res.headers[key] = value
    },
    getHeader(key: string) {
      return res.headers[key]
    },
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(body: unknown) {
      res.body = body as { message?: string }
      return res
    },
  }
  return res
}

describe('pembungkus handler API', () => {
  it('TC-42a mengubah kegagalan tak tertangkap jadi JSON, bukan halaman HTML', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const handler = withApi('uji', async () => {
      throw new Error("Can't reach database server")
    })
    const res = getResponse()

    await handler({ method: 'POST', headers: {} } as never, res as never)

    expect(res.statusCode).toBe(500)
    expect(res.body?.message).not.toContain('database server')
    expect(res.body?.message).toContain(res.headers['X-Request-Id'])
    errorSpy.mockRestore()
  })

  it('TC-42b mencatat kegagalan ke log dengan nama rute', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const handler = withApi('forms-detail', async () => {
      throw new Error('boom')
    })

    await handler({ method: 'PUT', headers: {} } as never, getResponse() as never)

    expect(errorSpy).toHaveBeenCalledTimes(1)
    const entry = JSON.parse(errorSpy.mock.calls[0][0] as string)
    expect(entry).toMatchObject({
      level: 'error',
      route: 'forms-detail',
      method: 'PUT',
      errorMessage: 'boom',
    })
    errorSpy.mockRestore()
  })

  it('TC-42c tidak menimpa balasan yang sudah terkirim sebagian', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = getResponse()
    const handler = withApi('uji', async () => {
      res.status(200).json({ message: 'sudah terkirim' })
      res.headersSent = true
      throw new Error('gagal setelahnya')
    })

    await handler({ method: 'GET', headers: {} } as never, res as never)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ message: 'sudah terkirim' })
    errorSpy.mockRestore()
  })

  it('TC-42e mencatat lama tiap permintaan yang berhasil', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = getResponse()
    const handler = withApi('forms', async (_req, response) => {
      response.status(200).json({ ok: true })
    })

    await handler({ method: 'GET', headers: {} } as never, res as never)

    const entry = JSON.parse(logSpy.mock.calls[0][0] as string)
    expect(entry).toMatchObject({
      level: 'info',
      route: 'forms',
      method: 'GET',
      status: 200,
    })
    expect(typeof entry.durationMs).toBe('number')
    logSpy.mockRestore()
  })

  it('TC-42f menaikkan permintaan lambat jadi peringatan, bukan info', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const nowSpy = vi
      .spyOn(Date, 'now')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValue(SLOW_REQUEST_MS + 1)

    const res = getResponse()
    const handler = withApi('responses', async (_req, response) => {
      response.status(201).json({ ok: true })
    })

    await handler({ method: 'POST', headers: {} } as never, res as never)

    expect(logSpy).not.toHaveBeenCalled()
    const entry = JSON.parse(warnSpy.mock.calls[0][0] as string)
    expect(entry).toMatchObject({ level: 'warn', route: 'responses' })
    expect(entry.durationMs).toBeGreaterThanOrEqual(SLOW_REQUEST_MS)

    nowSpy.mockRestore()
    warnSpy.mockRestore()
    logSpy.mockRestore()
  })

  it('TC-42d meneruskan balasan normal apa adanya', async () => {
    const res = getResponse()
    const handler = withApi('uji', async (_req, response) => {
      response.status(201).json({ id: 'form-1' })
    })

    await handler({ method: 'POST', headers: {} } as never, res as never)

    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({ id: 'form-1' })
  })
})
