import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'

interface FieldInput {
  label: string
  description?: string
  placeholder?: string
  type: string
  isRequired?: boolean
  options?: string[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const forms = await prisma.form.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { fields: true, responses: true } },
      },
    })

    return res.status(200).json(
      forms.map((form) => ({
        id: form.id,
        title: form.title,
        description: form.description ?? '',
        purpose: form.purpose ?? '',
        isAiEnabled: !!form.purpose,
        isPublished: form.isPublished,
        totalField: form._count.fields,
        totalResponse: form._count.responses,
        createdAt: form.createdAt.toISOString(),
      }))
    )
  }

  if (req.method === 'POST') {
    const {
      title,
      description,
      purpose,
      templateId,
      bannerUrl,
      meetingUrl,
      isPublished,
      fields,
    } = req.body as {
      title?: string
      description?: string
      purpose?: string
      templateId?: string
      bannerUrl?: string
      meetingUrl?: string
      isPublished?: boolean
      fields?: FieldInput[]
    }

    if (!title || !fields?.length) {
      return res
        .status(400)
        .json({ message: 'title dan minimal satu field wajib diisi.' })
    }

    const form = await prisma.form.create({
      data: {
        title,
        description: description || null,
        // Kosong berarti pembuat form mematikan analisis AI.
        purpose: purpose?.trim() || null,
        templateId: templateId?.trim() || null,
        bannerUrl: bannerUrl?.trim() || null,
        meetingUrl: meetingUrl?.trim() || null,
        isPublished: isPublished ?? true,
        fields: {
          create: fields.map((field, index) => ({
            label: field.label,
            description: field.description || null,
            placeholder: field.placeholder || null,
            type: field.type as never,
            isRequired: field.isRequired ?? false,
            options: field.options?.length ? field.options : undefined,
            order: index,
          })),
        },
      },
      select: { id: true, title: true },
    })

    return res.status(201).json({ id: form.id, title: form.title })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} not allowed` })
}
