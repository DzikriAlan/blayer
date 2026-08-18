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

  const { formId } = req.query

  const form = await prisma.form.findUnique({
    where: { id: String(formId) },
    include: {
      fields: { orderBy: { order: 'asc' } },
      responses: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!form) return res.status(404).json({ message: 'Form tidak ditemukan.' })

  return res.status(200).json({
    formId: form.id,
    formTitle: form.title,
    purpose: form.purpose ?? '',
    isAiEnabled: !!form.purpose,
    templateId: form.templateId ?? '',
    fields: form.fields.map((field) => ({
      id: field.id,
      label: field.label,
      type: field.type,
      options: (field.options as string[] | null) ?? [],
      isRequired: field.isRequired,
    })),
    responses: form.responses.map((response) => ({
      id: response.id,
      respondentName: response.respondentName ?? '',
      respondentEmail: response.respondentEmail ?? '',
      answers: (response.answers as Record<string, unknown>) ?? {},
      createdAt: response.createdAt.toISOString(),
    })),
  })
}
