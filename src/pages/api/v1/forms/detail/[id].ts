import type { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { getAuthUser } from '@/shared/lib/authServer'
import { withApi } from '@/shared/lib/apiHandler'
import { sendFailure, sendMethodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import { getFormsInput } from '@/shared/lib/formsInput'

const getFieldPayload = (field: {
  id: string
  label: string
  description: string | null
  placeholder: string | null
  type: string
  isRequired: boolean
  options: unknown
  order: number
}) => ({
  id: field.id,
  label: field.label,
  description: field.description ?? '',
  placeholder: field.placeholder ?? '',
  type: field.type,
  isRequired: field.isRequired,
  options: (field.options as string[] | null) ?? [],
  order: field.order,
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = String(req.query.id ?? '')
  if (!id) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'ID_REQUIRED', field: 'id', message: 'Id form wajib diisi.' }],
    })
  }

  const user = await getAuthUser(req)

  if (req.method === 'GET') {
    const form = await prisma.form.findUnique({
      where: { id },
      include: { fields: { orderBy: { order: 'asc' } } },
    })

    if (!form) {
      return sendFailure(res, {
        status: 404,
        message: 'Form tidak ditemukan.',
        errors: [{ code: 'FORM_NOT_FOUND', field: 'id', message: 'Form tidak ditemukan.' }],
      })
    }

    const isOwner = !!user && user.id === form.userId

    if (!isOwner && !form.isPublished) {
      return sendFailure(res, {
        status: 404,
        message: 'Form tidak ditemukan.',
        errors: [{ code: 'FORM_NOT_FOUND', field: 'id', message: 'Form tidak ditemukan.' }],
      })
    }

    const shared = {
      id: form.id,
      title: form.title,
      description: form.description ?? '',
      isAiEnabled: !!form.purpose,
      templateId: form.templateId ?? '',
      image: form.bannerUrl ?? '',
      qrisImage: form.qrisUrl ?? '',
      price: form.priceAmount ?? 0,
      isPublished: form.isPublished,
      createdAt: form.createdAt.toISOString(),
      fields: form.fields.map(getFieldPayload),
    }

    if (!isOwner) {
      return sendSuccess(res, {
        message: 'Detail form berhasil dimuat',
        data: { ...shared, purpose: '', meeting: '', video: '' },
      })
    }

    return sendSuccess(res, {
      message: 'Detail form berhasil dimuat',
      data: {
        ...shared,
        purpose: form.purpose ?? '',
        meeting: form.meetingUrl ?? '',
        video: form.videoUrl ?? '',
      },
    })
  }

  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    return sendMethodNotAllowed(res, req.method, ['GET', 'PUT', 'DELETE'])
  }

  if (!user) {
    return sendFailure(res, {
      status: 401,
      message: 'Perlu masuk lebih dulu.',
      errors: [{ code: 'UNAUTHENTICATED', field: '', message: 'Sesi tidak ditemukan.' }],
    })
  }

  const owner = await prisma.form.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!owner) {
    return sendFailure(res, {
      status: 404,
      message: 'Form tidak ditemukan.',
      errors: [{ code: 'FORM_NOT_FOUND', field: 'id', message: 'Form tidak ditemukan.' }],
    })
  }

  if (owner.userId !== user.id) {
    return sendFailure(res, {
      status: 403,
      message: 'Form ini bukan milik akun yang sedang masuk.',
      errors: [{ code: 'FORBIDDEN', field: '', message: 'Form ini milik akun lain.' }],
    })
  }

  if (req.method === 'DELETE') {
    await prisma.form.delete({ where: { id } })
    return sendSuccess(res, { message: 'Form berhasil dihapus', data: { id } })
  }

  if (
    !(await enforceRateLimit(req, res, {
      name: 'forms-update',
      limit: 60,
      windowMs: 60_000,
      scope: user.id,
    }))
  ) {
    return
  }

  const { data, error } = getFormsInput(req.body ?? {})
  if (error) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: error.code, field: error.field, message: error.message }],
    })
  }

  const { fields, ...scalars } = data
  const keptIds = fields
    .map((field) => field.id)
    .filter((fieldId): fieldId is string => !!fieldId)

  await prisma.$transaction([
    prisma.formField.deleteMany({
      where: { formId: id, id: { notIn: keptIds } },
    }),
    ...fields.map((field) => {
      const { id: fieldId, ...values } = field

      if (!fieldId) {
        return prisma.formField.create({ data: { formId: id, ...values } })
      }

      return prisma.formField.updateMany({
        where: { id: fieldId, formId: id },
        data: { ...values, options: values.options ?? Prisma.DbNull },
      })
    }),
    prisma.form.update({ where: { id }, data: scalars }),
  ])

  return sendSuccess(res, {
    message: 'Form berhasil diperbarui',
    data: { id, title: scalars.title },
  })
}

export default withApi('forms-detail', handler)
