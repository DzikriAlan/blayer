import type { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { getAuthUser } from '@/shared/lib/authServer'
import { withApi } from '@/shared/lib/apiHandler'
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
  if (!id) return res.status(400).json({ message: 'Id form wajib diisi.' })

  const user = await getAuthUser(req)

  if (req.method === 'GET') {
    const form = await prisma.form.findUnique({
      where: { id },
      include: { fields: { orderBy: { order: 'asc' } } },
    })

    if (!form) return res.status(404).json({ message: 'Form tidak ditemukan.' })

    const isOwner = !!user && user.id === form.userId

    if (!isOwner && !form.isPublished) {
      return res.status(404).json({ message: 'Form tidak ditemukan.' })
    }

    const shared = {
      id: form.id,
      title: form.title,
      description: form.description ?? '',
      isAiEnabled: !!form.purpose,
      templateId: form.templateId ?? '',
      bannerUrl: form.bannerUrl ?? '',
      qrisUrl: form.qrisUrl ?? '',
      priceAmount: form.priceAmount ?? 0,
      isPublished: form.isPublished,
      createdAt: form.createdAt.toISOString(),
      fields: form.fields.map(getFieldPayload),
    }

    if (!isOwner) {
      return res
        .status(200)
        .json({ ...shared, purpose: '', meetingUrl: '', videoUrl: '' })
    }

    return res.status(200).json({
      ...shared,
      purpose: form.purpose ?? '',
      meetingUrl: form.meetingUrl ?? '',
      videoUrl: form.videoUrl ?? '',
    })
  }

  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  if (!user) return res.status(401).json({ message: 'Perlu masuk lebih dulu.' })

  const owner = await prisma.form.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!owner) return res.status(404).json({ message: 'Form tidak ditemukan.' })

  if (owner.userId !== user.id) {
    return res
      .status(403)
      .json({ message: 'Form ini bukan milik akun yang sedang masuk.' })
  }

  if (req.method === 'DELETE') {
    await prisma.form.delete({ where: { id } })
    return res.status(200).json({ id })
  }

  if (
    !enforceRateLimit(req, res, {
      name: 'forms-update',
      limit: 60,
      windowMs: 60_000,
      scope: user.id,
    })
  ) {
    return
  }

  const { data, error } = getFormsInput(req.body ?? {})
  if (error) return res.status(400).json({ message: error.message })

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

  return res.status(200).json({ id, title: scalars.title })
}

export default withApi('forms-detail', handler)
