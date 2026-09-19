import type { NextApiRequest, NextApiResponse } from 'next'
import { IntegrationAuth } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { integrationInputSchema, parseInput } from '@/shared/lib/agentInput'
import { encryptSecret, getSecretHint } from '@/shared/lib/agentCrypto'
import { getQueryId } from '@/shared/lib/apiQuery'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const sendNotFound = (res: NextApiResponse) =>
  sendFailure(res, {
    status: 404,
    message: 'Integration tidak ditemukan',
    errors: [
      {
        code: 'INTEGRATION_NOT_FOUND',
        field: 'integrationId',
        message: 'Integration dengan id itu tidak ada.',
      },
    ],
  })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return

  const integrationId = getQueryId(req.query.integrationId)

  if (req.method === 'GET') {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
      include: { tools: { orderBy: { name: 'asc' } } },
    })

    if (!integration) return sendNotFound(res)

    return sendSuccess(res, {
      message: 'Integration berhasil dimuat',
      data: {
        id: integration.id,
        projectId: integration.projectId,
        slug: integration.slug,
        name: integration.name,
        description: integration.description ?? '',
        baseUrl: integration.baseUrl,
        auth: integration.auth,
        authHeader: integration.authHeader ?? '',
        hint: integration.hint ?? '',
        createdAt: integration.createdAt.toISOString(),
        tools: integration.tools.map((tool) => ({
          id: tool.id,
          integrationId: tool.integrationId,
          name: tool.name,
          description: tool.description,
          method: tool.method,
          path: tool.path,
          permission: tool.permission,
          inputSchema: tool.inputSchema,
          createdAt: tool.createdAt.toISOString(),
        })),
      },
    })
  }

  if (req.method === 'PUT') {
    const { data, errors } = parseInput(integrationInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
      select: { id: true, projectId: true, slug: true },
    })

    if (!integration) return sendNotFound(res)

    if (integration.slug !== data.slug) {
      const taken = await prisma.integration.findUnique({
        where: {
          projectId_slug: { projectId: integration.projectId, slug: data.slug },
        },
        select: { id: true },
      })

      if (taken) {
        return sendFailure(res, {
          status: 409,
          message: 'Slug integration sudah dipakai',
          errors: [
            {
              code: 'SLUG_TAKEN',
              field: 'slug',
              message: `Slug ${data.slug} sudah dipakai integration lain.`,
            },
          ],
        })
      }
    }

    // Kredensial hanya diganti kalau memang diisi ulang; membiarkannya kosong
    // berarti kunci lama tetap dipakai, bukan terhapus diam-diam.
    const secret = data.secret ? encryptSecret(data.secret) : null

    const updated = await prisma.integration.update({
      where: { id: integrationId },
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description || null,
        baseUrl: data.baseUrl.replace(/\/+$/, ''),
        auth: data.auth,
        authHeader: data.authHeader || null,
        ...(data.auth === IntegrationAuth.NONE
          ? { secret: null, hint: null }
          : secret
            ? { secret, hint: getSecretHint(data.secret) }
            : {}),
      },
      select: { id: true, slug: true, name: true },
    })

    return sendSuccess(res, {
      message: 'Integration berhasil diperbarui',
      data: updated,
    })
  }

  if (req.method === 'DELETE') {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
      select: { id: true },
    })

    if (!integration) return sendNotFound(res)

    await prisma.integration.delete({ where: { id: integrationId } })

    return sendSuccess(res, {
      message: 'Integration berhasil dihapus',
      data: { id: integrationId },
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'PUT', 'DELETE'])
}

export default withApi('integrations-detail', handler)
