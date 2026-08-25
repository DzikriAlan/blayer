import { beforeEach, describe, expect, it, vi } from 'vitest'

import handler, { SUBMIT_LIMIT } from '@/pages/api/v1/responses/index'
import { resetRateLimit } from '@/shared/lib/rateLimit'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    form: { findUnique: vi.fn() },
    formResponse: { create: vi.fn(), count: vi.fn() },
  },
}))

vi.mock('@/shared/lib/prisma', () => ({ prisma: prismaMock }))

const getForm = (patch: Record<string, unknown> = {}) => ({
  id: 'form-1',
  isPublished: true,
  meetingUrl: 'https://meet.google.com/rahasia',
  videoUrl: '',
  fields: [
    { id: 'field-1', label: 'Nama', isRequired: true },
    { id: 'field-2', label: 'Catatan', isRequired: false },
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

const call = async (body: Record<string, unknown>, ip = '10.0.0.1') => {
  const res = getResponse()
  await handler(
    {
      method: 'POST',
      headers: { 'x-forwarded-for': ip },
      socket: {},
      query: {},
      body,
    } as never,
    res as never
  )
  return res
}

const validBody = {
  formId: 'form-1',
  name: 'Sinta',
  answers: { 'field-1': 'Sinta' },
}

beforeEach(async () => {
  process.env.TRUST_PROXY_HOPS = '1'
  await resetRateLimit()
  prismaMock.form.findUnique = vi.fn().mockResolvedValue(getForm())
  prismaMock.formResponse.create = vi
    .fn()
    .mockResolvedValue({ id: 'res-1', createdAt: new Date('2026-08-19') })
  prismaMock.formResponse.count = vi.fn().mockResolvedValue(3)
})

describe('pengiriman jawaban', () => {
  it('TC-41a mengirim link acara hanya lewat balasan pengiriman', async () => {
    const res = await call(validBody)

    expect(res.statusCode).toBe(201)
    expect(res.body.data).toMatchObject({
      meeting: 'https://meet.google.com/rahasia',
      totalResponses: 3,
    })
  })

  it('TC-41b menolak jawaban untuk form yang masih draf', async () => {
    prismaMock.form.findUnique = vi
      .fn()
      .mockResolvedValue(getForm({ isPublished: false }))

    const res = await call(validBody)

    expect(res.statusCode).toBe(403)
    expect(prismaMock.formResponse.create).not.toHaveBeenCalled()
  })

  it('TC-41c membuang kunci jawaban yang bukan milik form ini', async () => {
    await call({
      ...validBody,
      answers: { 'field-1': 'Sinta', 'field-palsu': 'suntikan prompt' },
    })

    const saved = prismaMock.formResponse.create.mock.calls[0][0].data.answers
    expect(saved).toEqual({ 'field-1': 'Sinta' })
  })

  it('TC-41d memotong jawaban yang terlalu panjang', async () => {
    await call({
      ...validBody,
      answers: { 'field-1': 'a'.repeat(9000) },
    })

    const saved = prismaMock.formResponse.create.mock.calls[0][0].data.answers
    expect(saved['field-1']).toHaveLength(5000)
  })

  it('TC-41e menahan banjir jawaban dari satu sumber ke satu form', async () => {
    for (let index = 0; index < SUBMIT_LIMIT; index += 1) await call(validBody)

    const res = await call(validBody)

    expect(res.statusCode).toBe(429)
    expect(prismaMock.formResponse.create).toHaveBeenCalledTimes(SUBMIT_LIMIT)
  })

  it('TC-41f batasnya per form, bukan mengunci pengirim di form lain', async () => {
    for (let index = 0; index < SUBMIT_LIMIT; index += 1) await call(validBody)

    const res = await call({ ...validBody, formId: 'form-2' })

    expect(res.statusCode).toBe(201)
  })

  it('TC-41g pengirim dari IP lain tidak ikut terkunci', async () => {
    for (let index = 0; index < SUBMIT_LIMIT; index += 1) await call(validBody)

    const res = await call(validBody, '10.0.0.2')

    expect(res.statusCode).toBe(201)
  })

  it('TC-41h tanpa proxy tepercaya, alamat karangan tidak menambah kuota', async () => {
    delete process.env.TRUST_PROXY_HOPS

    for (let index = 0; index < SUBMIT_LIMIT; index += 1) {
      await call(validBody, `10.0.0.${index % 250}`)
    }

    const res = await call(validBody, '203.0.113.9')

    expect(res.statusCode).toBe(429)
  })
})
