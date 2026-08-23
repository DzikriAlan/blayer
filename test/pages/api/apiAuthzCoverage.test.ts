import { describe, expect, it, vi } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'

import formsHandler from '@/pages/api/v1/forms/index'
import responsesListHandler from '@/pages/api/v1/responses/list/[formId]'
import analysisHandler from '@/pages/api/v1/analysis/[formId]'

vi.mock('@/shared/lib/prisma', () => ({
  prisma: {
    form: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/shared/lib/authServer', () => ({
  getAuthGuard: async (_req: NextApiRequest, res: NextApiResponse) => {
    res.status(401).json({ message: 'Perlu masuk lebih dulu.' })
    return null
  },
  getAuthUser: async () => null,
}))

const getResponse = () => {
  const res = {
    statusCode: 0,
    body: null as unknown,
    headers: {} as Record<string, string>,
    setHeader(key: string, value: string) {
      res.headers[key] = String(value)
    },
    getHeader(key: string) {
      return res.headers[key]
    },
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(body: unknown) {
      res.body = body
      return res
    },
  }
  return res
}

describe('Otorisasi Rute API (Authorization Coverage)', () => {
  it('TC-AUTHZ-01 forms index menolak akses tanpa token (401)', async () => {
    const res = getResponse()
    await formsHandler({ method: 'GET', headers: {} } as never, res as never)
    expect(res.statusCode).toBe(401)
    expect(res.body).toEqual({ message: 'Perlu masuk lebih dulu.' })
  })

  it('TC-AUTHZ-02 responses list menolak akses tanpa token (401)', async () => {
    const res = getResponse()
    await responsesListHandler(
      { method: 'GET', headers: {}, query: { formId: 'f1' } } as never,
      res as never
    )
    expect(res.statusCode).toBe(401)
    expect(res.body).toEqual({ message: 'Perlu masuk lebih dulu.' })
  })

  it('TC-AUTHZ-03 analysis run menolak akses tanpa token (401)', async () => {
    const res = getResponse()
    await analysisHandler(
      { method: 'POST', headers: {}, query: { formId: 'f1' } } as never,
      res as never
    )
    expect(res.statusCode).toBe(401)
    expect(res.body).toEqual({ message: 'Perlu masuk lebih dulu.' })
  })
})
