import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { sendSuccess, sendError } from '@/shared/lib/apiResponse'
import { handlePrismaError } from '@/shared/lib/prismaError'

const updateAgentDefault = async (excludeId?: string) => {
  await prisma.agent.updateMany({
    where: { isDefault: true, ...(excludeId ? { id: { not: excludeId } } : {}) },
    data: { isDefault: false },
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const agents = await prisma.agent.findMany({ orderBy: { createdAt: 'desc' } })
    return sendSuccess(res, agents)
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return sendError(res, 401, 'UNAUTHORIZED', 'You must be signed in')
  }

  if (req.method === 'POST') {
    const { name, description, image, personalization, isDefault } = req.body ?? {}
    if (!name?.trim()) {
      return sendError(res, 400, 'BAD_REQUEST', 'Missing name')
    }
    if (isDefault) await updateAgentDefault()
    const agent = await prisma.agent.create({
      data: {
        name,
        description: description ?? null,
        image: image ?? null,
        personalization: personalization ?? null,
        isDefault: isDefault ?? false,
      },
    })
    return sendSuccess(res, agent, { status: 201, message: 'Agent created successfully' })
  }

  if (req.method === 'PATCH') {
    const id = req.query.id as string
    if (!id) return sendError(res, 400, 'BAD_REQUEST', 'Missing id')
    const { name, description, image, personalization, isDefault } = req.body ?? {}
    if (isDefault) await updateAgentDefault(id)
    try {
      const agent = await prisma.agent.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(image !== undefined && { image }),
          ...(personalization !== undefined && { personalization }),
          ...(isDefault !== undefined && { isDefault }),
        },
      })
      return sendSuccess(res, agent, { message: 'Agent updated successfully' })
    } catch (error) {
      if (handlePrismaError(error, res, 'Agent')) return
      throw error
    }
  }

  if (req.method === 'DELETE') {
    const id = req.query.id as string
    if (!id) return sendError(res, 400, 'BAD_REQUEST', 'Missing id')
    try {
      await prisma.agent.delete({ where: { id } })
      return sendSuccess(res, null, { message: 'Agent deleted successfully' })
    } catch (error) {
      if (handlePrismaError(error, res, 'Agent')) return
      throw error
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE'])
  return sendError(res, 405, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`)
}
