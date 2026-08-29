import { beforeEach, describe, expect, it, vi } from 'vitest'

import handler from '@/pages/api/v1/forms/detail/[id]'

const { prismaMock, authMock } = vi.hoisted(() => ({
  prismaMock: {
    form: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    formField: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  authMock: { user: null as { id: string; email: string } | null },
}))

vi.mock('@/shared/lib/prisma', () => ({ prisma: prismaMock }))

vi.mock('@/shared/lib/authServer', () => ({
  getAuthUser: async () => authMock.user,
}))

const getForm = (patch: Record<string, unknown> = {}) => ({
  id: 'form-1',
  slug: 'pendaftaran-workshop',
  userId: 'user-a',
  title: 'Pendaftaran Workshop',
  description: 'Ikutan yuk',
  purpose: 'Pilih peserta paling relevan dengan materi',
  templateId: 'event',
  bannerUrl: 'https://cdn/banner.png',
  meetingUrl: 'https://meet.google.com/rahasia',
  qrisUrl: 'https://cdn/qris.png',
  price: 50000,
  isPublished: true,
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
  fields: [
    {
      id: 'field-1',
      label: 'Nama',
      description: null,
      placeholder: null,
      type: 'SHORT_TEXT',
      isRequired: true,
      options: null,
      order: 0,
    },
  ],
  ...patch,
})

const getResponse = () => {
  const res = {
    statusCode: 0,
    body: null as unknown as {
      success: boolean
      status: number
      message: string
      data: never
      meta: { request_id: string; timestamp: string; version: string }
      errors: { code: string; field: string; message: string }[] | null
    },
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
      res.body = body as typeof res.body
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
  authMock.user = null
  prismaMock.form.findUnique = vi.fn().mockResolvedValue(getForm())
  prismaMock.form.findFirst = vi.fn().mockResolvedValue(getForm())
  prismaMock.form.update = vi.fn().mockResolvedValue({ id: 'form-1' })
  prismaMock.form.delete = vi.fn().mockResolvedValue({ id: 'form-1' })
  prismaMock.formField.deleteMany = vi.fn().mockReturnValue('deleteMany')
  prismaMock.formField.create = vi.fn().mockReturnValue('create')
  prismaMock.formField.updateMany = vi.fn().mockReturnValue('updateMany')
  prismaMock.$transaction = vi.fn().mockResolvedValue([])
})

describe('detail form untuk pengisi', () => {
  it('TC-40a menahan link rahasia dari pengisi tanpa sesi', async () => {
    const res = await call({ method: 'GET', headers: {}, query: { id: 'form-1' } })

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toMatchObject({
      meeting: '',
      qrisImage: 'https://cdn/qris.png',
    })
    expect(res.body.data).not.toHaveProperty('purpose')
  })

  it('TC-40f menerima tautan pendek, bukan hanya id', async () => {
    const res = await call({
      method: 'GET',
      headers: {},
      query: { id: 'pendaftaran-workshop' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toMatchObject({ slug: 'pendaftaran-workshop' })

    const where = prismaMock.form.findFirst.mock.calls[0][0].where
    expect(where.OR).toEqual([
      { id: 'pendaftaran-workshop' },
      { slug: 'pendaftaran-workshop' },
    ])
  })

  it('TC-40b menahan link dari akun lain yang sudah masuk', async () => {
    authMock.user = { id: 'user-b', email: 'b@blayer.id' }

    const res = await call({ method: 'GET', headers: {}, query: { id: 'form-1' } })

    expect(res.body.data).toMatchObject({ meeting: '' })
    expect(res.body.data).not.toHaveProperty('purpose')
  })

  it('TC-40c memberi isi utuh kepada pemiliknya', async () => {
    authMock.user = { id: 'user-a', email: 'a@blayer.id' }

    const res = await call({ method: 'GET', headers: {}, query: { id: 'form-1' } })

    expect(res.body.data).toMatchObject({
      meeting: 'https://meet.google.com/rahasia',
    })
    expect(res.body.data).not.toHaveProperty('purpose')
  })

  it('TC-40d menyamarkan draf sebagai tidak ada untuk non-pemilik', async () => {
    prismaMock.form.findFirst = vi
      .fn()
      .mockResolvedValue(getForm({ isPublished: false }))

    const res = await call({ method: 'GET', headers: {}, query: { id: 'form-1' } })

    expect(res.statusCode).toBe(404)
  })

  it('TC-40e pemilik tetap bisa membuka drafnya sendiri', async () => {
    authMock.user = { id: 'user-a', email: 'a@blayer.id' }
    prismaMock.form.findFirst = vi
      .fn()
      .mockResolvedValue(getForm({ isPublished: false }))

    const res = await call({ method: 'GET', headers: {}, query: { id: 'form-1' } })

    expect(res.statusCode).toBe(200)
  })
})

describe('menyunting dan menghapus form', () => {
  const body = {
    title: 'Judul Baru',
    fields: [
      { id: 'field-1', label: 'Nama', type: 'SHORT_TEXT' },
      { label: 'Alasan ikut', type: 'LONG_TEXT' },
    ],
  }

  it('TC-39a menolak PUT tanpa sesi', async () => {
    const res = await call({
      method: 'PUT',
      headers: {},
      query: { id: 'form-1' },
      body,
    })

    expect(res.statusCode).toBe(401)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('TC-39b menolak PUT dari akun yang bukan pemilik', async () => {
    authMock.user = { id: 'user-b', email: 'b@blayer.id' }
    prismaMock.form.findUnique = vi.fn().mockResolvedValue({ userId: 'user-a' })

    const res = await call({
      method: 'PUT',
      headers: {},
      query: { id: 'form-1' },
      body,
    })

    expect(res.statusCode).toBe(403)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('TC-39c mempertahankan id field lama dan membuat yang baru saja', async () => {
    authMock.user = { id: 'user-a', email: 'a@blayer.id' }
    prismaMock.form.findUnique = vi.fn().mockResolvedValue({ userId: 'user-a' })

    const res = await call({
      method: 'PUT',
      headers: {},
      query: { id: 'form-1' },
      body,
    })

    expect(res.statusCode).toBe(200)
    expect(prismaMock.formField.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'field-1', formId: 'form-1' } })
    )
    expect(prismaMock.formField.create).toHaveBeenCalledTimes(1)
    expect(prismaMock.formField.deleteMany).toHaveBeenCalledWith({
      where: { formId: 'form-1', id: { notIn: ['field-1'] } },
    })
  })

  it('TC-39d menolak payload tanpa field', async () => {
    authMock.user = { id: 'user-a', email: 'a@blayer.id' }
    prismaMock.form.findUnique = vi.fn().mockResolvedValue({ userId: 'user-a' })

    const res = await call({
      method: 'PUT',
      headers: {},
      query: { id: 'form-1' },
      body: { title: 'Judul', fields: [] },
    })

    expect(res.statusCode).toBe(400)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('TC-39e menolak DELETE dari akun yang bukan pemilik', async () => {
    authMock.user = { id: 'user-b', email: 'b@blayer.id' }
    prismaMock.form.findUnique = vi.fn().mockResolvedValue({ userId: 'user-a' })

    const res = await call({ method: 'DELETE', headers: {}, query: { id: 'form-1' } })

    expect(res.statusCode).toBe(403)
    expect(prismaMock.form.delete).not.toHaveBeenCalled()
  })

  it('TC-39f menghapus form milik sendiri', async () => {
    authMock.user = { id: 'user-a', email: 'a@blayer.id' }
    prismaMock.form.findUnique = vi.fn().mockResolvedValue({ userId: 'user-a' })

    const res = await call({ method: 'DELETE', headers: {}, query: { id: 'form-1' } })

    expect(res.statusCode).toBe(200)
    expect(prismaMock.form.delete).toHaveBeenCalledWith({
      where: { id: 'form-1' },
    })
  })
  it('TC-39g menolak tautan yang sudah dipakai form lain', async () => {
    authMock.user = { id: 'user-a', email: 'a@blayer.id' }
    prismaMock.form.findUnique = vi.fn().mockResolvedValue({ userId: 'user-a' })
    prismaMock.form.findFirst = vi.fn().mockResolvedValue({ id: 'form-lain' })

    const res = await call({
      method: 'PUT',
      headers: {},
      query: { id: 'form-1' },
      body: { ...body, slug: 'daftar-aja-gratis' },
    })

    expect(res.statusCode).toBe(409)
    expect(res.body.errors?.[0].code).toBe('SLUG_TAKEN')
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('TC-39h menyimpan tautan baru ketika belum dipakai siapa pun', async () => {
    authMock.user = { id: 'user-a', email: 'a@blayer.id' }
    prismaMock.form.findUnique = vi.fn().mockResolvedValue({ userId: 'user-a' })
    prismaMock.form.findFirst = vi.fn().mockResolvedValue(null)

    const res = await call({
      method: 'PUT',
      headers: {},
      query: { id: 'form-1' },
      body: { ...body, slug: 'daftar-aja-gratis' },
    })

    expect(res.statusCode).toBe(200)
    expect(prismaMock.form.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'daftar-aja-gratis' }),
      })
    )
  })
})
