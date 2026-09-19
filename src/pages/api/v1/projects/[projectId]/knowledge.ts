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
    const documents = await prisma.knowledgeDocument.findMany({
      where: { projectId },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    })

    // Isi dokumen bisa panjang; daftarnya cukup membawa cuplikan supaya UI tidak
    // menarik puluhan ribu karakter hanya untuk menampilkan judul.
    return sendSuccess(res, {
      message: 'Daftar dokumen berhasil dimuat',
      data: documents.map((document) => ({
        id: document.id,
        title: document.title,
        preview: document.content.slice(0, 240),
        totalChars: document.content.length,
        updatedAt: document.updatedAt.toISOString(),
      })),
    })
  }

  if (req.method === 'POST') {
    const { data, errors } = parseInput(knowledgeInputSchema, req.body)

    if (!data) {
      return sendFailure(res, { status: 400, message: 'Validasi gagal', errors: errors ?? [] })
    }

    const document = await prisma.knowledgeDocument.create({
      data: { projectId, title: data.title, content: data.content },
      select: { id: true, title: true },
    })

    return sendSuccess(res, {
      status: 201,
      message: 'Dokumen berhasil disimpan',
      data: document,
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'POST'])
}

export default withApi('projects-knowledge', handler)
