import type { NextApiRequest, NextApiResponse } from 'next'
import { IntegrationAuth } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { integrationInputSchema, parseInput } from '@/shared/lib/agentInput'
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
    // Daftar ini juga dipakai builder untuk memilih tool, jadi kontrak toolnya
    // ikut dibawa — jumlahnya kecil dan menghemat satu putaran permintaan.
    const integrations = await prisma.integration.findMany({
      where: { projectId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        tools: { orderBy: { name: 'asc' } },
        _count: { select: { tools: true } },
      },
    })

    return sendSuccess(res, {
      message: 'Daftar integration berhasil dimuat',
      data: integrations.map((integration) => ({
        id: integration.id,
        slug: integration.slug,
        name: integration.name,
        description: integration.description ?? '',
        baseUrl: integration.baseUrl,
        auth: integration.auth,
        authHeader: integration.authHeader ?? '',
        hint: integration.hint ?? '',
        totalTools: integration._count.tools,
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
      })),
    })
  }

  if (req.method === 'POST') {
    const { data, errors } = parseInput(integrationInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    if (data.auth !== IntegrationAuth.NONE && !data.secret) {
      return sendFailure(res, {
        status: 400,
        message: 'Validasi gagal',
        errors: [
          {
            code: 'INVALID_INPUT',
            field: 'secret',
            message: 'Integration dengan autentikasi wajib membawa kredensialnya.',
          },
        ],
      })
    }

    const taken = await prisma.integration.findUnique({
      where: { projectId_slug: { projectId, slug: data.slug } },
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
            message: `Slug ${data.slug} sudah dipakai integration lain di project ini.`,
          },
        ],
      })
    }

    // Kredensial ke API project disimpan terenkripsi seperti kunci provider —
    // Blayer memegang aksesnya, bukan datanya.
    const secret = data.secret ? encryptSecret(data.secret) : null

    if (data.secret && !secret) {
      return sendFailure(res, {
        status: 503,
        message: 'Instance ini belum bisa menyimpan kredensial integration.',
        errors: [
          {
            code: 'CONFIG_MISSING',
            field: ENCRYPTION_KEY_ENV,
            message: `Setel ${ENCRYPTION_KEY_ENV} berisi 32 byte acak dalam base64.`,
          },
        ],
      })
    }

    const integration = await prisma.integration.create({
      data: {
        projectId,
        slug: data.slug,
        name: data.name,
        description: data.description || null,
        baseUrl: data.baseUrl.replace(/\/+$/, ''),
        auth: data.auth,
        authHeader: data.authHeader || null,
        secret,
        hint: data.secret ? getSecretHint(data.secret) : null,
      },
      select: { id: true, slug: true, name: true },
    })

    return sendSuccess(res, {
      status: 201,
      message: 'Integration berhasil dibuat',
      data: integration,
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'POST'])
}

export default withApi('projects-integrations', handler)
