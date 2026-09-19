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

const sendNotFound = (res: NextApiResponse) =>
  sendFailure(res, {
    status: 404,
    message: 'Tool tidak ditemukan',
    errors: [
      {
        code: 'TOOL_NOT_FOUND',
        field: 'toolId',
        message: 'Tool dengan id itu tidak ada.',
      },
    ],
  })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return

  const toolId = getQueryId(req.query.toolId)

  const tool = await prisma.toolDefinition.findUnique({
    where: { id: toolId },
    select: { id: true, integrationId: true, name: true },
  })

  if (!tool) return sendNotFound(res)

  if (req.method === 'PUT') {
    const { data, errors } = parseInput(toolInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    if (tool.name !== data.name) {
      const taken = await prisma.toolDefinition.findUnique({
        where: {
          integrationId_name: {
            integrationId: tool.integrationId,
            name: data.name,
          },
        },
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
    }

    // Versi agent yang sudah dipublikasikan tetap menunjuk tool ini, jadi
    // perubahan kontrak langsung berlaku — itu sebabnya deployment checklist di
    // PRD menuntut definisi tool diperbarui bersama endpointnya.
    const updated = await prisma.toolDefinition.update({
      where: { id: toolId },
      data: {
        name: data.name,
        description: data.description,
        method: data.method,
        path: data.path,
        permission: data.permission,
        inputSchema: data.inputSchema as Prisma.InputJsonValue,
      },
      select: { id: true, name: true, permission: true },
    })

    return sendSuccess(res, { message: 'Tool berhasil diperbarui', data: updated })
  }

  if (req.method === 'DELETE') {
    await prisma.toolDefinition.delete({ where: { id: toolId } })

    return sendSuccess(res, { message: 'Tool berhasil dihapus', data: { id: toolId } })
  }

  return sendMethodNotAllowed(res, req.method, ['PUT', 'DELETE'])
}

export default withApi('tools-detail', handler)
