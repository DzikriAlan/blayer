import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  const { id } = req.query

  const form = await prisma.form.findUnique({
    where: { id: String(id) },
    include: { fields: { orderBy: { order: 'asc' } } },
  })

  if (!form) return res.status(404).json({ message: 'Form tidak ditemukan.' })

  return res.status(200).json({
    id: form.id,
    title: form.title,
    description: form.description ?? '',
    purpose: form.purpose ?? '',
    isAiEnabled: !!form.purpose,
    isPublished: form.isPublished,
    createdAt: form.createdAt.toISOString(),
    fields: form.fields.map((field) => ({
      id: field.id,
      label: field.label,
      description: field.description ?? '',
      placeholder: field.placeholder ?? '',
      type: field.type,
      isRequired: field.isRequired,
      options: (field.options as string[] | null) ?? [],
      order: field.order,
    })),
  })
}
