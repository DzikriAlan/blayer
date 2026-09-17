import { Prisma } from '@prisma/client'
import type { NextApiResponse } from 'next'
import { sendError } from './apiResponse'

/**
 * Maps common Prisma error codes to the RESPONSE.md error envelope.
 * Returns true if it handled (and responded to) the error, false otherwise.
 */
export function handlePrismaError(error: unknown, res: NextApiResponse, resource: string): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      sendError(res, 404, 'NOT_FOUND', `${resource} not found`)
      return true
    }
    if (error.code === 'P2002') {
      sendError(res, 409, 'CONFLICT', `${resource} conflict`)
      return true
    }
  }
  return false
}
