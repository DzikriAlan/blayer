import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { sendSuccess, sendError } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return sendError(res, 401, 'UNAUTHORIZED', 'You must be signed in')
  }

  const sessionId = req.query.sessionId as string
  const chatSession = await prisma.chatSession.findUnique({ where: { sessionId } })
  if (!chatSession || chatSession.userId !== session.user.id) {
    return sendError(res, 404, 'NOT_FOUND', 'Conversation not found')
  }

  if (req.method === 'GET') {
    const history = await prisma.chatHistory.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, createdAt: true },
    })
    return sendSuccess(res, history)
  }

  if (req.method === 'DELETE') {
    await prisma.chatHistory.deleteMany({ where: { sessionId } })
    await prisma.chatSession.delete({ where: { sessionId } })
    return sendSuccess(res, null, { message: 'Conversation deleted successfully' })
  }

  res.setHeader('Allow', ['GET', 'DELETE'])
  return sendError(res, 405, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`)
}
