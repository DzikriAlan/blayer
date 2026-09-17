import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { sendSuccess, sendError } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`)
  }

  const id = req.query.id as string
  if (!id) return sendError(res, 400, 'BAD_REQUEST', 'Missing id')

  const agent = await prisma.agent.findUnique({
    where: { id },
    select: { id: true, name: true, image: true, description: true },
  })
  if (!agent) return sendError(res, 404, 'NOT_FOUND', 'Agent not found')

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  return sendSuccess(res, agent)
}
