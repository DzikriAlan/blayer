import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { getAuthGuard } from '@/shared/lib/authServer'
import { withApi } from '@/shared/lib/apiHandler'
import { sendFailure, sendMethodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import { getFormsInput } from '@/shared/lib/formsInput'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await getAuthGuard(req, res)
    if (!user) return

    const forms = await prisma.form.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { fields: true, responses: true } },
      },
    })

    return sendSuccess(res, {
      message: 'Riwayat form berhasil dimuat',
      data: forms.map((form) => ({
        id: form.id,
        title: form.title,
        description: form.description ?? '',
        purpose: form.purpose ?? '',
        isAiEnabled: !!form.purpose,
        templateId: form.templateId ?? '',
        isPublished: form.isPublished,
        totalFields: form._count.fields,
        totalResponses: form._count.responses,
        createdAt: form.createdAt.toISOString(),
      })),
    })
  }

  if (req.method === 'POST') {
    const user = await getAuthGuard(req, res)
    if (!user) return

    if (
      !(await enforceRateLimit(req, res, {
        name: 'forms-create',
        limit: 20,
        windowMs: 60_000,
        scope: user.id,
      }))
    ) {
      return
    }

    const { data, error } = getFormsInput(req.body ?? {})
    if (error) {
      return sendFailure(res, {
        status: 400,
        message: 'Validasi gagal',
        errors: [{ code: error.code, field: error.field, message: error.message }],
      })
    }

    const form = await prisma.form.create({
      data: {
        userId: user.id,
        ...data,
        fields: {
          create: data.fields.map((field) => ({ ...field, id: undefined })),
        },
      },
      select: { id: true, title: true },
    })

    return sendSuccess(res, {
      status: 201,
      message: 'Form berhasil dibuat',
      data: { id: form.id, title: form.title },
    })
  }

  return sendMethodNotAllowed(res, req.method, ['GET', 'POST'])
}

export default withApi('forms', handler)
