import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { fields: true },
  })

  if (!form) return res.status(404).json({ message: 'Form tidak ditemukan.' })

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

  const response = await prisma.formResponse.create({
    data: {
      formId,
      respondentName: respondentName || null,
      respondentEmail: respondentEmail || null,
      answers: answers as never,
      // Durasi negatif atau bukan angka diabaikan supaya data tetap bersih.
      durationSeconds:
        typeof durationSeconds === 'number' &&
        Number.isFinite(durationSeconds) &&
        durationSeconds >= 0
          ? Math.round(durationSeconds)
          : null,
    },
    select: { id: true, createdAt: true },
  })

  // Dipakai layar konfirmasi acara untuk menampilkan jumlah yang sudah daftar.
  const totalResponse = await prisma.formResponse.count({ where: { formId } })

  return res.status(201).json({
    id: response.id,
    totalResponse,
    createdAt: response.createdAt.toISOString(),
  })
}
