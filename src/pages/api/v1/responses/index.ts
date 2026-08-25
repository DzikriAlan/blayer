import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { sendFailure, sendMethodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { enforceRateLimit } from '@/shared/lib/rateLimit'

const MAX_ANSWER_LENGTH = 5_000
const MAX_NAME_LENGTH = 200

export const SUBMIT_LIMIT = 100
export const SUBMIT_WINDOW_MS = 60_000

const getTrimmed = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return sendMethodNotAllowed(res, req.method, ['POST'])

  const { formId, name, email, answers, duration } = req.body as {
    formId?: string
    name?: string
    email?: string
    answers?: Record<string, unknown>
    duration?: number
  }

  if (!formId || !answers) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'PAYLOAD_INCOMPLETE', field: 'formId', message: 'formId dan answers wajib diisi.' }],
    })
  }

  if (
    !(await enforceRateLimit(req, res, {
      name: 'responses-create',
      limit: SUBMIT_LIMIT,
      windowMs: SUBMIT_WINDOW_MS,
      scope: formId,
    }))
  ) {
    return
  }

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { fields: true },
  })

  if (!form) {
    return sendFailure(res, {
      status: 404,
      message: 'Form tidak ditemukan.',
      errors: [{ code: 'FORM_NOT_FOUND', field: 'formId', message: 'Form tidak ditemukan.' }],
    })
  }

  if (!form.isPublished) {
    return sendFailure(res, {
      status: 403,
      message: 'Form ini belum dibuka untuk menerima jawaban.',
      errors: [{ code: 'FORM_NOT_PUBLISHED', field: 'formId', message: 'Form belum dipublikasikan.' }],
    })
  }

  const missingField = form.fields.find((field) => {
    if (!field.isRequired) return false
    const answer = answers[field.id]
    if (Array.isArray(answer)) return answer.length === 0
    return answer === undefined || answer === null || answer === ''
  })

  if (missingField) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'FIELD_REQUIRED', field: missingField.id, message: `Field "${missingField.label}" wajib diisi.` }],
    })
  }

  const knownIds = new Set(form.fields.map((field) => field.id))

  const getAnswerValue = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).slice(0, MAX_ANSWER_LENGTH))
    }
    if (typeof value === 'string') return value.slice(0, MAX_ANSWER_LENGTH)
    return value
  }

  const cleanAnswers = Object.fromEntries(
    Object.entries(answers)
      .filter(([fieldId]) => knownIds.has(fieldId))
      .map(([fieldId, value]) => [fieldId, getAnswerValue(value)])
  )

  const response = await prisma.formResponse.create({
    data: {
      formId,
      respondentName: getTrimmed(name, MAX_NAME_LENGTH) || null,
      respondentEmail: getTrimmed(email, MAX_NAME_LENGTH) || null,
      answers: cleanAnswers as never,
      durationSeconds:
        typeof duration === 'number' &&
        Number.isFinite(duration) &&
        duration >= 0
          ? Math.round(duration)
          : null,
    },
    select: { id: true, createdAt: true },
  })

  const totalResponse = await prisma.formResponse.count({ where: { formId } })

  return sendSuccess(res, {
    status: 201,
    message: 'Jawaban berhasil dikirim',
    data: {
      id: response.id,
      totalResponses: totalResponse,
      createdAt: response.createdAt.toISOString(),
      meeting: form.meetingUrl ?? '',
      video: form.videoUrl ?? '',
    },
  })
}

export default withApi('responses', handler)
