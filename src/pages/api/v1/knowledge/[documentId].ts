import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { knowledgeInputSchema, parseInput } from '@/shared/lib/agentInput'
import { getQueryId } from '@/shared/lib/apiQuery'
import {
  sendFailure,
  sendMethodNotAllowed,
  sendSuccess,
} from '@/shared/lib/apiResponse'

const sendNotFound = (res: NextApiResponse) =>
  sendFailure(res, {
    status: 404,
    message: 'Dokumen tidak ditemukan',
    errors: [
      {
        code: 'DOCUMENT_NOT_FOUND',
        field: 'documentId',
        message: 'Dokumen dengan id itu tidak ada.',
      },
    ],
  })

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return

  const documentId = getQueryId(req.query.documentId)

  const document = await prisma.knowledgeDocument.findUnique({
    where: { id: documentId },
  })

  if (!document) return sendNotFound(res)

  if (req.method === 'GET') {
    return sendSuccess(res, {
      message: 'Dokumen berhasil dimuat',
      data: {
        id: document.id,
        title: document.title,
        content: document.content,
        updatedAt: document.updatedAt.toISOString(),
      },
    })
  }

  if (req.method === 'PUT') {
    const { data, errors } = parseInput(knowledgeInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    const updated = await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { title: data.title, content: data.content },
      select: { id: true, title: true },
    })

    return sendSuccess(res, { message: 'Dokumen berhasil diperbarui', data: updated })
  }

  if (req.method === 'DELETE') {
    await prisma.knowledgeDocument.delete({ where: { id: documentId } })

    return sendSuccess(res, {
      message: 'Dokumen berhasil dihapus',
      data: { id: documentId },
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'PUT', 'DELETE'])
}

export default withApi('knowledge-detail', handler)
