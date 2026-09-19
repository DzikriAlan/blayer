import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { credentialInputSchema, parseInput } from '@/shared/lib/agentInput'
import {
  ENCRYPTION_KEY_ENV,
  encryptSecret,
  getSecretHint,
} from '@/shared/lib/agentCrypto'
import { getQueryId } from '@/shared/lib/apiQuery'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return

  const projectId = getQueryId(req.query.projectId)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  })

  if (!project) {
    return sendFailure(res, {
      status: 404,
      message: 'Project tidak ditemukan',
      errors: [
        {
          code: 'PROJECT_NOT_FOUND',
          field: 'projectId',
          message: 'Project dengan id itu tidak ada.',
        },
      ],
    })
  }

  if (req.method === 'GET') {
    const credentials = await prisma.providerCredential.findMany({
      where: { projectId },
      orderBy: [{ provider: 'asc' }, { environment: 'asc' }],
      select: {
        id: true,
        provider: true,
        environment: true,
        hint: true,
        updatedAt: true,
      },
    })

    // Kunci providernya sendiri tidak pernah keluar lagi dari rute ini —
    // yang terbaca hanya empat karakter terakhirnya.
    return sendSuccess(res, {
      message: 'Daftar kredensial provider berhasil dimuat',
      data: credentials.map((credential) => ({
        ...credential,
        updatedAt: credential.updatedAt.toISOString(),
      })),
    })
  }

  if (req.method === 'PUT') {
    const { data, errors } = parseInput(credentialInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    const secret = encryptSecret(data.secret)

    if (!secret) {
      return sendFailure(res, {
        status: 503,
        message: 'Instance ini belum bisa menyimpan kredensial provider.',
        errors: [
          {
            code: 'CONFIG_MISSING',
            field: ENCRYPTION_KEY_ENV,
            message: `Setel ${ENCRYPTION_KEY_ENV} berisi 32 byte acak dalam base64.`,
          },
        ],
      })
    }

    const credential = await prisma.providerCredential.upsert({
      where: {
        projectId_provider_environment: {
          projectId,
          provider: data.provider,
          environment: data.environment,
        },
      },
      create: {
        projectId,
        provider: data.provider,
        environment: data.environment,
        secret,
        hint: getSecretHint(data.secret),
      },
      update: { secret, hint: getSecretHint(data.secret) },
      select: { id: true, provider: true, environment: true, hint: true },
    })

    return sendSuccess(res, {
      message: 'Kredensial provider berhasil disimpan',
      data: credential,
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'PUT'])
}

export default withApi('projects-credentials', handler)
