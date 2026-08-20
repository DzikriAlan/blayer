import { beforeEach, describe, expect, it, vi } from 'vitest'

// vi.mock diangkat ke atas berkas oleh Vitest, jadi impor biasa sudah menerima
// versi tiruan dari prisma dan penjaga sesi.
import handler from '@/pages/api/v1/forms/index'

// vi.hoisted dipakai karena vi.mock diangkat ke atas berkas — tiruan harus
// sudah ada sebelum modul yang diuji diimpor.
const { prismaMock, authMock } = vi.hoisted(() => ({
  prismaMock: {
    form: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
  authMock: { user: null as { id: string; email: string } | null },
}))

vi.mock('@/shared/lib/prisma', () => ({ prisma: prismaMock }))

vi.mock('@/shared/lib/authServer', () => ({
  getAuthGuard: async (
    _req: unknown,
    res: { status: (code: number) => { json: (body: unknown) => void } }
  ) => {
    if (!authMock.user) {
      res.status(401).json({ message: 'Perlu masuk lebih dulu.' })
      return null
    }
    return authMock.user
  },
}))


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
  prismaMock.form.findMany = vi.fn().mockResolvedValue([])
  prismaMock.form.create = vi.fn().mockResolvedValue({ id: 'form-1', title: 'Judul' })
  authMock.user = null
})

describe('kepemilikan form di API', () => {
  it('TC-26q menolak daftar form tanpa sesi', async () => {
    const res = await call({ method: 'GET', headers: {}, query: {} })

    expect(res.statusCode).toBe(401)
    expect(prismaMock.form.findMany).not.toHaveBeenCalled()
  })

  it('TC-26r menyaring daftar form di query, bukan setelah data terbaca', async () => {
    authMock.user = { id: 'user-a', email: 'a@blayer.id' }

    await call({ method: 'GET', headers: {}, query: {} })

    expect(prismaMock.form.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-a' } })
    )
  })

  it('TC-26s menolak pembuatan form tanpa sesi', async () => {
    const res = await call({
      method: 'POST',
      headers: {},
      query: {},
      body: { title: 'Judul', fields: [{ label: 'Nama', type: 'SHORT_TEXT' }] },
    })

    expect(res.statusCode).toBe(401)
    expect(prismaMock.form.create).not.toHaveBeenCalled()
  })

  it('TC-26t mengambil pemilik dari token dan mengabaikan userId di body', async () => {
    authMock.user = { id: 'user-a', email: 'a@blayer.id' }

    await call({
      method: 'POST',
      headers: {},
      query: {},
      body: {
        title: 'Judul',
        // Pengirim mencoba mengaku sebagai akun lain.
        userId: 'user-korban',
        fields: [{ label: 'Nama', type: 'SHORT_TEXT' }],
      },
    })

    const arg = prismaMock.form.create.mock.calls[0][0]
    expect(arg.data.userId).toBe('user-a')
  })
})
