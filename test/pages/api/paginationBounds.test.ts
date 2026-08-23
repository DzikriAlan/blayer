import { beforeEach, describe, expect, it, vi } from 'vitest'

import publicHandler from '@/pages/api/v1/forms/public'
import responsesListHandler from '@/pages/api/v1/responses/list/[formId]'
import { resetRateLimit } from '@/shared/lib/rateLimit'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    form: { findMany: vi.fn(), findUnique: vi.fn() },
    formResponse: { findMany: vi.fn(), count: vi.fn() },
  },
}))

vi.mock('@/shared/lib/prisma', () => ({ prisma: prismaMock }))

vi.mock('@/shared/lib/authServer', () => ({
  getAuthGuard: async () => ({ id: 'user-1', email: 'a@b.id' }),
}))

const getResponse = () => {
  const res = {
    statusCode: 0,
    body: null as never,
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
      res.body = body as never
      return res
    },
  }
  return res
}

const getForm = (index: number) => ({
  id: `form-${index}`,
  title: `Form ${index}`,
  description: '',
  templateId: 'event',
  image: '',
  price: 0,
  createdAt: new Date('2026-08-01'),
  _count: { fields: 1, responses: 0 },
})

const call = async (handler: typeof publicHandler, query: Record<string, string>) => {
  const res = getResponse()
  await handler(
    { method: 'GET', headers: {}, socket: {}, query, body: {} } as never,
    res as never
  )
  return res
}

beforeEach(async () => {
  await resetRateLimit()
  prismaMock.form.findMany = vi.fn().mockResolvedValue([])
  prismaMock.form.findUnique = vi
    .fn()
    .mockResolvedValue({ id: 'form-1', userId: 'user-1', title: 'F', fields: [] })
  prismaMock.formResponse.findMany = vi.fn().mockResolvedValue([])
  prismaMock.formResponse.count = vi.fn().mockResolvedValue(0)
})

describe('batas pembacaan katalog publik', () => {
  it('TC-46a permintaan tanpa parameter tetap dibatasi', async () => {
    await call(publicHandler, {})

    const args = prismaMock.form.findMany.mock.calls[0][0]
    expect(args.take).toBe(51)
  })

  it('TC-46a limit yang kelewat besar dipangkas, yang tidak masuk akal diabaikan', async () => {
    await call(publicHandler, { limit: '5000' })
    expect(prismaMock.form.findMany.mock.calls[0][0].take).toBe(101)

    prismaMock.form.findMany.mockClear()
    await call(publicHandler, { limit: 'banyak' })
    expect(prismaMock.form.findMany.mock.calls[0][0].take).toBe(51)

    prismaMock.form.findMany.mockClear()
    await call(publicHandler, { limit: '-3' })
    expect(prismaMock.form.findMany.mock.calls[0][0].take).toBe(2)
  })

  it('TC-46b cursor hanya muncul kalau memang ada halaman berikutnya', async () => {
    prismaMock.form.findMany = vi
      .fn()
      .mockResolvedValue(Array.from({ length: 3 }, (_, i) => getForm(i)))

    const res = await call(publicHandler, { limit: '2' })
    const body = res.body as {
      data: unknown[]
      meta: { pagination: { next_cursor: string | null; has_more: boolean } }
    }

    expect(body.data).toHaveLength(2)
    expect(body.meta.pagination.has_more).toBe(true)
    expect(body.meta.pagination.next_cursor).toBe('form-1')
  })

  it('TC-46b halaman terakhir tidak menawarkan cursor', async () => {
    prismaMock.form.findMany = vi
      .fn()
      .mockResolvedValue([getForm(0), getForm(1)])

    const res = await call(publicHandler, { limit: '5' })
    const body = res.body as {
      meta: { pagination: { has_more: boolean; next_cursor: string | null } }
    }

    expect(body.meta.pagination.has_more).toBe(false)
    expect(body.meta.pagination.next_cursor).toBeNull()
  })
})

describe('batas pembacaan daftar jawaban', () => {
  it('TC-46c permintaan tanpa parameter tetap dibatasi', async () => {
    await call(responsesListHandler, { formId: 'form-1' })

    const args = prismaMock.formResponse.findMany.mock.calls[0][0]
    expect(args.take).toBe(51)
  })
})
