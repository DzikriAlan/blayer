import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { sendSuccess, sendError } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`)
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return sendError(res, 401, 'UNAUTHORIZED', 'You must be signed in')
  }

  const sessionId = req.query.sessionId as string
  const { title } = req.body ?? {}
  if (!title?.trim()) return sendError(res, 400, 'BAD_REQUEST', 'Missing title')

  const chatSession = await prisma.chatSession.findUnique({ where: { sessionId } })
  if (!chatSession || chatSession.userId !== session.user.id) {
    return sendError(res, 404, 'NOT_FOUND', 'Conversation not found')
  }

  await prisma.chatSession.update({ where: { sessionId }, data: { title } })
  return sendSuccess(res, null, { message: 'Conversation renamed successfully' })
}
