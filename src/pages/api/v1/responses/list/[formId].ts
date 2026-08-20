import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { getAuthGuard } from '@/shared/lib/authServer'
import { withApi } from '@/shared/lib/apiHandler'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  const user = await getAuthGuard(req, res)
  if (!user) return

  const { formId } = req.query

  const form = await prisma.form.findUnique({
    where: { id: String(formId) },
    include: {
      fields: { orderBy: { order: 'asc' } },
      responses: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!form) return res.status(404).json({ message: 'Form tidak ditemukan.' })

  if (form.userId !== user.id) {
    return res
      .status(403)
      .json({ message: 'Form ini bukan milik akun yang sedang masuk.' })
  }

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
      durationSeconds: response.durationSeconds ?? 0,
      createdAt: response.createdAt.toISOString(),
    })),
  })
}

export default withApi('responses-list', handler)
