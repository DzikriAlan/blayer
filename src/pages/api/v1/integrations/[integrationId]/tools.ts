import type { NextApiRequest, NextApiResponse } from 'next'
import type { Prisma } from '@prisma/client'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { parseInput, toolInputSchema } from '@/shared/lib/agentInput'
import { getQueryId } from '@/shared/lib/apiQuery'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return

  const integrationId = getQueryId(req.query.integrationId)

  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
    select: { id: true },
  })

  if (!integration) {
    return sendFailure(res, {
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
  }

  if (req.method === 'GET') {
    const tools = await prisma.toolDefinition.findMany({
      where: { integrationId },
      orderBy: [{ name: 'asc' }],
    })

    return sendSuccess(res, {
      message: 'Daftar tool berhasil dimuat',
      data: tools.map((tool) => ({
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
    })
  }

  if (req.method === 'POST') {
    const { data, errors } = parseInput(toolInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    const taken = await prisma.toolDefinition.findUnique({
      where: { integrationId_name: { integrationId, name: data.name } },
      select: { id: true },
    })

    if (taken) {
      return sendFailure(res, {
        status: 409,
        message: 'Nama tool sudah dipakai',
        errors: [
          {
            code: 'NAME_TAKEN',
            field: 'name',
            message: `Tool bernama ${data.name} sudah ada di integration ini.`,
          },
        ],
      })
    }

    // Yang tersimpan hanya kontraknya: nama, deskripsi, method, potongan path,
    // dan skema masukan. Implementasinya tetap di sisi project.
    const tool = await prisma.toolDefinition.create({
      data: {
        integrationId,
        name: data.name,
        description: data.description,
        method: data.method,
        path: data.path,
        permission: data.permission,
        inputSchema: data.inputSchema as Prisma.InputJsonValue,
      },
      select: { id: true, name: true, permission: true },
    })

    return sendSuccess(res, {
      status: 201,
      message: 'Tool berhasil didaftarkan',
      data: tool,
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'POST'])
}

export default withApi('integrations-tools', handler)
