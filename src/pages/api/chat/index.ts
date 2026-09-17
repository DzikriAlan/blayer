import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/shared/lib/auth'
import { streamChat } from '@/shared/lib/chatStream'
import { sendError } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`)
  }

  const session = await getServerSession(req, res, authOptions)
  const { message, sessionId, agentId, personalization, isPreview } = req.body ?? {}

  if (!message || !sessionId) {
    return sendError(res, 400, 'BAD_REQUEST', 'Missing message or sessionId')
  }

  await streamChat(
    {
      message,
      sessionId,
      agentId,
      personalization,
      isPreview,
      userId: session?.user?.id ?? null,
    },
    res,
  )
}
