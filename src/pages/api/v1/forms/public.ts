import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { sendMethodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { enforceRateLimit } from '@/shared/lib/rateLimit'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return sendMethodNotAllowed(res, req.method, ['GET'])

  if (
    !(await enforceRateLimit(req, res, {
      name: 'forms-public',
      limit: 120,
      windowMs: 60_000,
    }))
  ) {
    return
  }

  const limitQuery = Number(req.query.limit)
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined

  const limit = Number.isFinite(limitQuery)
    ? Math.min(Math.max(Math.trunc(limitQuery), 1), 100)
    : 50

  const forms = await prisma.form.findMany({
    where: { isPublished: true },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      templateId: true,
      bannerUrl: true,
      priceAmount: true,
      createdAt: true,
      _count: { select: { fields: true, responses: true } },
    },
  })

  const hasMore = forms.length > limit
  const items = hasMore ? forms.slice(0, limit) : forms
  const nextCursor = hasMore ? items[items.length - 1].id : null

  const mapped = items.map((form) => ({
    id: form.id,
    slug: form.slug ?? '',
    title: form.title,
    description: form.description ?? '',
    templateId: form.templateId ?? '',
    image: form.bannerUrl ?? '',
    price: form.priceAmount ?? 0,
    totalFields: form._count.fields,
    totalResponses: form._count.responses,
    createdAt: form.createdAt.toISOString(),
  }))

  return sendSuccess(res, {
    message: 'Katalog form publik berhasil dimuat',
    data: mapped,
    pagination: { limit, next_cursor: nextCursor, has_more: hasMore },
  })
}

export default withApi('forms-public', handler)
