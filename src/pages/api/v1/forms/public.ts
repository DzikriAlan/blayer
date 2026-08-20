import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { enforceRateLimit } from '@/shared/lib/rateLimit'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  if (
    !(await enforceRateLimit(req, res, {
      name: 'forms-public',
      limit: 120,
      windowMs: 60_000,
    }))
  ) {
    return
  }

  const forms = await prisma.form.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      templateId: true,
      bannerUrl: true,
      priceAmount: true,
      createdAt: true,
      _count: { select: { fields: true, responses: true } },
    },
  })

  return res.status(200).json(
    forms.map((form) => ({
      id: form.id,
      title: form.title,
      description: form.description ?? '',
      templateId: form.templateId ?? '',
      bannerUrl: form.bannerUrl ?? '',
      priceAmount: form.priceAmount ?? 0,
      totalField: form._count.fields,
      totalResponse: form._count.responses,
      createdAt: form.createdAt.toISOString(),
    }))
  )
}

export default withApi('forms-public', handler)
