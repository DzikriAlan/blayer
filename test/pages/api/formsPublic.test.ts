import { beforeEach, describe, expect, it, vi } from 'vitest'

// vi.hoisted dipakai karena vi.mock diangkat ke atas berkas — tiruan harus
// sudah ada sebelum modul yang diuji diimpor.
const { prismaMock, authMock } = vi.hoisted(() => ({
  prismaMock: { form: { findMany: vi.fn() } },
  authMock: { called: false },
}))

vi.mock('@/shared/lib/prisma', () => ({ prisma: prismaMock }))

// Katalog publik tidak boleh menyentuh penjaga sesi sama sekali. Kalau suatu
// saat ada yang memasangnya, tiruan ini yang akan menangkap.
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
    setHeader: vi.fn(),
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
      bannerUrl: null,
      priceAmount: null,
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
    // Jawabannya selalu beramplop sekarang, karena batas jumlahnya tidak
    // pernah opsional — tanpa itu jalur default membaca seluruh tabel.
    const body = res.body as { items: unknown[]; hasMore: boolean }
    expect(Array.isArray(body.items)).toBe(true)
    expect(body).toHaveProperty('nextCursor')
    expect(body).toHaveProperty('hasMore')
  })

  it('TC-26aa hanya form yang sudah dipublikasikan yang ikut terbaca', async () => {
    await call({ method: 'GET', headers: {}, query: {} })

    expect(prismaMock.form.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isPublished: true } })
    )
  })

  it('TC-26ab tidak membocorkan purpose maupun kolom milik pembuat form', async () => {
    const res = await call({ method: 'GET', headers: {}, query: {} })

    const [form] = (res.body as { items: Record<string, unknown>[] }).items
    expect(Object.keys(form).sort()).toEqual([
      'bannerUrl',
      'createdAt',
      'description',
      'id',
      'priceAmount',
      'templateId',
      'title',
      'totalField',
      'totalResponse',
    ])

    // Kolom rahasia tidak boleh ikut diminta dari database sejak awal.
    const select = prismaMock.form.findMany.mock.calls[0][0].select
    expect(select.purpose).toBeUndefined()
    expect(select.qrisUrl).toBeUndefined()
    expect(select.meetingUrl).toBeUndefined()
    expect(select.videoUrl).toBeUndefined()
    expect(select.userId).toBeUndefined()
  })
})
