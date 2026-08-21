import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock, authMock } = vi.hoisted(() => ({
  prismaMock: { form: { findMany: vi.fn() } },
  authMock: { called: false },
}))

vi.mock('@/shared/lib/prisma', () => ({ prisma: prismaMock }))

vi.mock('@/shared/lib/authServer', () => ({
  getAuthGuard: async () => {
    authMock.called = true
    return null
  },
  getAuthUser: async () => {
    authMock.called = true
    return null
  },
}))

import handler from '@/pages/api/v1/forms/public'

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

const call = async (req: Record<string, unknown>) => {
  const res = getResponse()
  await handler(req as never, res as never)
  return res
}

beforeEach(() => {
  authMock.called = false
  prismaMock.form.findMany = vi.fn().mockResolvedValue([
    {
      id: 'form-1',
      title: 'Ujian Matematika',
      description: 'Ujian bab satu',
      templateId: 'exam',
      image: null,
      price: null,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      _count: { fields: 5, responses: 12 },
    },
  ])
})

describe('katalog form publik', () => {
  it('TC-26z terbuka tanpa sesi — halaman depan harus tetap berisi', async () => {
    const res = await call({ method: 'GET', headers: {}, query: {} })

    expect(res.statusCode).toBe(200)
    expect(authMock.called).toBe(false)
    const body = res.body as {
      data: unknown[]
      meta: { pagination: Record<string, unknown> }
    }
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.meta.pagination).toHaveProperty('next_cursor')
    expect(body.meta.pagination).toHaveProperty('has_more')
  })

  it('TC-26aa hanya form yang sudah dipublikasikan yang ikut terbaca', async () => {
    await call({ method: 'GET', headers: {}, query: {} })

    expect(prismaMock.form.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isPublished: true } })
    )
  })

  it('TC-26ab tidak membocorkan purpose maupun kolom milik pembuat form', async () => {
    const res = await call({ method: 'GET', headers: {}, query: {} })

    const [form] = (res.body as { data: Record<string, unknown>[] }).data
    expect(Object.keys(form).sort()).toEqual([
      'createdAt',
      'description',
      'id',
      'image',
      'price',
      'templateId',
      'title',
      'totalFields',
      'totalResponses',
    ])

    const select = prismaMock.form.findMany.mock.calls[0][0].select
    expect(select.purpose).toBeUndefined()
    expect(select.qrisImage).toBeUndefined()
    expect(select.meeting).toBeUndefined()
    expect(select.video).toBeUndefined()
    expect(select.userId).toBeUndefined()
  })
})
