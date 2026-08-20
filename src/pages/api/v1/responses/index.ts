import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { enforceRateLimit } from '@/shared/lib/rateLimit'

const MAX_ANSWER_LENGTH = 5_000
const MAX_NAME_LENGTH = 200

const getTrimmed = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  const { formId, respondentName, respondentEmail, answers, durationSeconds } =
    req.body as {
      formId?: string
      respondentName?: string
      respondentEmail?: string
      answers?: Record<string, unknown>
      durationSeconds?: number
    }

  if (!formId || !answers) {
    return res.status(400).json({ message: 'formId dan answers wajib diisi.' })
  }

  if (
    !enforceRateLimit(req, res, {
      name: 'responses-create',
      limit: 5,
      windowMs: 60_000,
      scope: formId,
    })
  ) {
    return
  }

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { fields: true },
  })

  if (!form) return res.status(404).json({ message: 'Form tidak ditemukan.' })

  if (!form.isPublished) {
    return res
      .status(403)
      .json({ message: 'Form ini belum dibuka untuk menerima jawaban.' })
  }

  const missingField = form.fields.find((field) => {
    if (!field.isRequired) return false
    const answer = answers[field.id]
    if (Array.isArray(answer)) return answer.length === 0
    return answer === undefined || answer === null || answer === ''
  })

  if (missingField) {
    return res
      .status(400)
      .json({ message: `Field "${missingField.label}" wajib diisi.` })
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
      respondentName: getTrimmed(respondentName, MAX_NAME_LENGTH) || null,
      respondentEmail: getTrimmed(respondentEmail, MAX_NAME_LENGTH) || null,
      answers: cleanAnswers as never,
      durationSeconds:
        typeof durationSeconds === 'number' &&
        Number.isFinite(durationSeconds) &&
        durationSeconds >= 0
          ? Math.round(durationSeconds)
          : null,
    },
    select: { id: true, createdAt: true },
  })

  const totalResponse = await prisma.formResponse.count({ where: { formId } })

  return res.status(201).json({
    id: response.id,
    totalResponse,
    createdAt: response.createdAt.toISOString(),
    meetingUrl: form.meetingUrl ?? '',
    videoUrl: form.videoUrl ?? '',
  })
}

export default withApi('responses', handler)
