import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { sendSuccess, sendError } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`)
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return sendError(res, 401, 'UNAUTHORIZED', 'You must be signed in')
  }

  const conversations = await prisma.chatSession.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: { sessionId: true, title: true, createdAt: true, updatedAt: true },
  })
  return sendSuccess(res, conversations)
}
