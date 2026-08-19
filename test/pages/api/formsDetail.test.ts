import { beforeEach, describe, expect, it, vi } from 'vitest'

import handler from '@/pages/api/v1/forms/detail/[id]'

const { prismaMock, authMock } = vi.hoisted(() => ({
  prismaMock: {
    form: {
      findUnique: vi.fn(),
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
  userId: 'user-a',
  title: 'Pendaftaran Workshop',
  description: 'Ikutan yuk',
  purpose: 'Pilih peserta paling relevan dengan materi',
  templateId: 'event',
  bannerUrl: 'https://cdn/banner.png',
  meetingUrl: 'https://meet.google.com/rahasia',
  videoUrl: 'https://youtu.be/rahasia',
  qrisUrl: 'https://cdn/qris.png',
  priceAmount: 50000,
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
    body: null as never,
    setHeader: vi.fn(),
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

const call = async (req: Record<string, unknown>) => {
  const res = getResponse()
  await handler(req as never, res as never)
  return res
}

beforeEach(() => {
  authMock.user = null
  prismaMock.form.findUnique = vi.fn().mockResolvedValue(getForm())
  prismaMock.form.update = vi.fn().mockResolvedValue({ id: 'form-1' })
  prismaMock.form.delete = vi.fn().mockResolvedValue({ id: 'form-1' })
  prismaMock.formField.deleteMany = vi.fn().mockReturnValue('deleteMany')
  prismaMock.formField.create = vi.fn().mockReturnValue('create')
  prismaMock.formField.updateMany = vi.fn().mockReturnValue('updateMany')
  prismaMock.$transaction = vi.fn().mockResolvedValue([])
})

describe('detail form untuk pengisi', () => {
  it('TC-40a menahan tujuan AI dan link rahasia dari pengisi tanpa sesi', async () => {
    const res = await call({ method: 'GET', headers: {}, query: { id: 'form-1' } })

    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      purpose: '',
      meetingUrl: '',
      videoUrl: '',
      // QRIS tetap ikut: kodenya harus dipindai sebelum jawaban dikirim.
      qrisUrl: 'https://cdn/qris.png',
      isAiEnabled: true,
    })
  })

  it('TC-40b menahan tujuan dan link dari akun lain yang sudah masuk', async () => {
    authMock.user = { id: 'user-b', email: 'b@blayer.id' }

    const res = await call({ method: 'GET', headers: {}, query: { id: 'form-1' } })

    expect(res.body).toMatchObject({ purpose: '', meetingUrl: '', videoUrl: '' })
  })

  it('TC-40c memberi isi utuh kepada pemiliknya', async () => {
    authMock.user = { id: 'user-a', email: 'a@blayer.id' }

    const res = await call({ method: 'GET', headers: {}, query: { id: 'form-1' } })

    expect(res.body).toMatchObject({
      purpose: 'Pilih peserta paling relevan dengan materi',
      meetingUrl: 'https://meet.google.com/rahasia',
      videoUrl: 'https://youtu.be/rahasia',
    })
  })

  it('TC-40d menyamarkan draf sebagai tidak ada untuk non-pemilik', async () => {
    prismaMock.form.findUnique = vi
      .fn()
      .mockResolvedValue(getForm({ isPublished: false }))

    const res = await call({ method: 'GET', headers: {}, query: { id: 'form-1' } })

    expect(res.statusCode).toBe(404)
  })

  it('TC-40e pemilik tetap bisa membuka drafnya sendiri', async () => {
    authMock.user = { id: 'user-a', email: 'a@blayer.id' }
    prismaMock.form.findUnique = vi
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
    // Field lama disunting di tempat — jawaban yang sudah masuk memakai id ini
    // sebagai kunci, jadi id-nya tidak boleh berganti.
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
})
