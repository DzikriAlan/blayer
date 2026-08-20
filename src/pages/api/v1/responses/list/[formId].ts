import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { getAuthGuard } from '@/shared/lib/authServer'
import { withApi } from '@/shared/lib/apiHandler'
import { enforceRateLimit } from '@/shared/lib/rateLimit'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  const user = await getAuthGuard(req, res)
  if (!user) return

  if (
    !(await enforceRateLimit(req, res, {
      name: 'responses-list',
      limit: 60,
      windowMs: 60_000,
      scope: user.id,
    }))
  ) {
    return
  }

  const { formId } = req.query
  const limitQuery = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined
  const isPaginated = limitQuery !== undefined || cursor !== undefined
  const limit = limitQuery ? Math.min(Math.max(limitQuery, 1), 100) : 50

  const form = await prisma.form.findUnique({
    where: { id: String(formId) },
    include: {
      fields: { orderBy: { order: 'asc' } },
    },
  })

  if (!form) return res.status(404).json({ message: 'Form tidak ditemukan.' })

  // Jawaban peserta hanya boleh dibaca pemilik formnya.
  if (form.userId !== user.id) {
    return res
      .status(403)
      .json({ message: 'Form ini bukan milik akun yang sedang masuk.' })
  }

  const rawResponses = await prisma.formResponse.findMany({
    where: { formId: form.id },
    take: isPaginated ? limit + 1 : undefined,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })

  let nextCursor: string | null = null
  let responses = rawResponses
  if (isPaginated && rawResponses.length > limit) {
    responses = rawResponses.slice(0, limit)
    nextCursor = responses[responses.length - 1].id
  }

  const mappedResponses = responses.map((response) => ({
    id: response.id,
    respondentName: response.respondentName ?? '',
    respondentEmail: response.respondentEmail ?? '',
    answers: (response.answers as Record<string, unknown>) ?? {},
    durationSeconds: response.durationSeconds ?? 0,
    createdAt: response.createdAt.toISOString(),
  }))

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
    responses: mappedResponses,
    ...(isPaginated ? { nextCursor, hasMore: nextCursor !== null } : {}),
  })
}

export default withApi('responses-list', handler)
