import type { NextApiResponse } from 'next'
import { prisma } from './prisma'
import { deepseek } from './ai'

const DEFAULT_SYSTEM_PROMPT = 'Kamu adalah asisten AI yang helpful dan ramah.'

export interface StreamChatInput {
  message: string
  sessionId: string
  agentId?: string
  userId?: string | null
  personalization?: string
  isPreview?: boolean
}

export async function streamChat(input: StreamChatInput, res: NextApiResponse): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const isPreview = input.isPreview ?? false

  try {
    if (!isPreview) {
      try {
        await prisma.chatSession.upsert({
          where: { sessionId: input.sessionId },
          update: { updatedAt: new Date() },
          create: { sessionId: input.sessionId, userId: input.userId ?? null, title: null },
        })
      } catch {
        // Silently continue — chat history will still be created if the session already exists
      }
    }

    const agent = input.agentId && !input.personalization
      ? await prisma.agent.findUnique({ where: { id: input.agentId } })
      : null

    const systemPrompt = input.personalization ?? agent?.personalization ?? DEFAULT_SYSTEM_PROMPT

    const history = isPreview
      ? []
      : await prisma.chatHistory.findMany({
          where: { sessionId: input.sessionId },
          orderBy: { createdAt: 'asc' },
          take: 10,
          select: { role: true, content: true },
        })

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: input.message },
    ]

    if (!isPreview) {
      await prisma.chatHistory.create({
        data: { sessionId: input.sessionId, role: 'user', content: input.message },
      })
    }

    const stream = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      stream: true,
    })

    let fullResponse = ''
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? ''
      if (text) {
        fullResponse += text
        res.write(`data: ${JSON.stringify({ text })}\n\n`)
      }
    }

    if (!isPreview) {
      await prisma.chatHistory.create({
        data: { sessionId: input.sessionId, role: 'assistant', content: fullResponse },
      })
    }
  } catch (error) {
    console.error('Chat stream error', error)
    res.write(`data: ${JSON.stringify({ text: 'Terjadi kesalahan, silakan coba lagi.' })}\n\n`)
  } finally {
    res.end()
  }
}
