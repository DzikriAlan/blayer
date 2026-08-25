import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getRateLimitStore } from '@/shared/lib/rateLimitStore'
import { sendFailure, sendMethodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'

const DATABASE_TIMEOUT_MS = 3_000

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return sendMethodNotAllowed(res, req.method, ['GET'])

  const getDatabaseCheck = async () => {
    const startedAt = Date.now()

    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_resolve, reject) =>
          setTimeout(
            () => reject(new Error('database tidak menjawab')),
            DATABASE_TIMEOUT_MS
          )
        ),
      ])

      return { isReady: true, durationMs: Date.now() - startedAt }
    } catch {
      return { isReady: false, durationMs: Date.now() - startedAt }
    }
  }

  const database = await getDatabaseCheck()

  if (!database.isReady) {
    return sendFailure(res, {
      status: 503,
      message: 'Layanan belum siap melayani permintaan.',
      errors: [
        {
          code: 'DATABASE_UNAVAILABLE',
          field: '',
          message: 'Basis data tidak menjawab.',
        },
      ],
    })
  }

  return sendSuccess(res, {
    message: 'Layanan siap',
    data: {
      isReady: true,
      databaseMs: database.durationMs,
      rateLimitStore: getRateLimitStore().name,
      uptimeSeconds: Math.round(process.uptime()),
    },
  })
}

export default withApi('health', handler)
