import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { anthropic } from '@/shared/lib/anthropic'
import { getAuthGuard } from '@/shared/lib/authServer'
import { withApi } from '@/shared/lib/apiHandler'
import { sendFailure, sendMethodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'
import { enforceRateLimit } from '@/shared/lib/rateLimit'

const analysisSchema = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description:
        'Ringkasan naratif 3-5 kalimat mengenai kualitas keseluruhan jawaban yang masuk.',
    },
    recommendation: {
      type: 'string',
      description:
        'Rekomendasi akhir yang menjawab langsung tujuan form, menyebut nama/ID responden terbaik beserta alasannya.',
    },
    ranking: {
      type: 'array',
      description: 'Seluruh responden, diurutkan dari peringkat terbaik.',
      items: {
        type: 'object',
        properties: {
          responseId: { type: 'string' },
          respondentName: { type: 'string' },
          rank: { type: 'integer' },
          score: {
            type: 'integer',
            description: 'Skor kecocokan terhadap tujuan form, 0-100.',
          },
          verdict: {
            type: 'string',
            description: 'Label singkat, contoh: "Sangat Direkomendasikan".',
          },
          strengths: { type: 'array', items: { type: 'string' } },
          concerns: { type: 'array', items: { type: 'string' } },
          reasoning: {
            type: 'string',
            description: 'Alasan penilaian, merujuk pada jawaban konkret.',
          },
        },
        required: [
          'responseId',
          'respondentName',
          'rank',
          'score',
          'verdict',
          'strengths',
          'concerns',
          'reasoning',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['summary', 'recommendation', 'ranking'],
  additionalProperties: false,
} as const

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { formId } = req.query

  const user = await getAuthGuard(req, res)
  if (!user) return

  const owner = await prisma.form.findUnique({
    where: { id: String(formId) },
    select: { userId: true },
  })

  if (!owner) {
    return sendFailure(res, {
      status: 404,
      message: 'Form tidak ditemukan.',
      errors: [{ code: 'FORM_NOT_FOUND', field: 'formId', message: 'Form tidak ditemukan.' }],
    })
  }

  if (owner.userId !== user.id) {
    return sendFailure(res, {
      status: 403,
      message: 'Form ini bukan milik akun yang sedang masuk.',
      errors: [{ code: 'FORBIDDEN', field: '', message: 'Form ini milik akun lain.' }],
    })
  }

  if (req.method === 'GET') {
    const analysis = await prisma.formAnalysis.findFirst({
      where: { formId: String(formId) },
      orderBy: { createdAt: 'desc' },
    })

    if (!analysis) {
      return sendSuccess(res, { message: 'Belum ada analisis tersimpan', data: null })
    }

    return sendSuccess(res, {
      message: 'Analisis berhasil dimuat',
      data: {
        id: analysis.id,
        formId: analysis.formId,
        purpose: analysis.purpose,
        summary: analysis.summary,
        recommendation: analysis.recommendation,
        ranking: analysis.ranking,
        createdAt: analysis.createdAt.toISOString(),
      },
    })
  }

  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, req.method, ['GET', 'POST'])
  }

  if (
    !(await enforceRateLimit(req, res, {
      name: 'analysis-run',
      limit: 5,
      windowMs: 10 * 60_000,
      scope: user.id,
    }))
  ) {
    return
  }

  if (
    !(await enforceRateLimit(req, res, {
      name: 'analysis-daily-quota',
      limit: 20,
      windowMs: 24 * 60 * 60_000,
      scope: user.id,
    }))
  ) {
    return
  }

  const form = await prisma.form.findUnique({
    where: { id: String(formId) },
    include: {
      fields: { orderBy: { order: 'asc' } },
      responses: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!form) {
    return sendFailure(res, {
      status: 404,
      message: 'Form tidak ditemukan.',
      errors: [{ code: 'FORM_NOT_FOUND', field: 'formId', message: 'Form tidak ditemukan.' }],
    })
  }

  if (!form.purpose) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'AI_NOT_ENABLED', field: 'purpose', message: 'Form ini tidak mengaktifkan analisis AI. Tambahkan tujuan form terlebih dahulu.' }],
    })
  }

  if (!form.responses.length) {
    return sendFailure(res, {
      status: 400,
      message: 'Validasi gagal',
      errors: [{ code: 'NO_RESPONSES', field: '', message: 'Belum ada jawaban yang bisa dianalisis.' }],
    })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res
      .status(500)
      .json({ message: 'ANTHROPIC_API_KEY belum diset pada environment.' })
  }

  const getFieldLabel = (fieldId: string) =>
    form.fields.find((field) => field.id === fieldId)?.label ?? fieldId

  const getAnswerText = (answer: unknown) => {
    if (Array.isArray(answer)) return answer.join(', ')
    if (answer === null || answer === undefined || answer === '')
      return '(tidak dijawab)'
    return String(answer)
  }

  const getTranscript = () =>
    form.responses
      .map((response, index) => {
        const answers = (response.answers as Record<string, unknown>) ?? {}
        const lines = Object.entries(answers)
          .map(
            ([fieldId, answer]) =>
              `  - ${getFieldLabel(fieldId)}: ${getAnswerText(answer)}`
          )
          .join('\n')

        return [
          `Responden #${index + 1}`,
          `  responseId: ${response.id}`,
          `  nama: ${response.respondentName || 'Anonim'}`,
          `  email: ${response.respondentEmail || '-'}`,
          lines,
        ].join('\n')
      })
      .join('\n\n')

  const prompt = [
    `Tujuan form ini (ditetapkan oleh pembuat form):`,
    form.purpose,
    '',
    `Judul form: ${form.title}`,
    form.description ? `Deskripsi form: ${form.description}` : '',
    '',
    `Berikut ${form.responses.length} jawaban yang masuk:`,
    '',
    getTranscript(),
    '',
    'Evaluasi setiap responden terhadap tujuan form di atas. Beri peringkat semua responden dari yang paling sesuai, dengan skor 0-100 dan alasan yang merujuk pada jawaban konkret mereka. Gunakan responseId persis seperti tertulis. Jawab dalam Bahasa Indonesia.',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const message = await anthropic.beta.messages.create({
      model: 'claude-opus-5',
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      thinking: { type: 'adaptive' },
      system:
        'Kamu adalah evaluator yang teliti dan adil. Kamu menilai jawaban form hanya berdasarkan bukti yang ada di jawaban itu sendiri, tanpa mengarang informasi. Jika data tidak cukup untuk menilai suatu aspek, katakan itu secara eksplisit pada bagian concerns.',
      output_config: {
        effort: 'high',
        format: { type: 'json_schema', schema: analysisSchema },
      },
      messages: [{ role: 'user', content: prompt }],
    } as never)

    if (message.stop_reason === 'refusal') {
      return sendFailure(res, {
        status: 422,
        message: 'Analisis ditolak oleh sistem keamanan model. Coba sesuaikan tujuan form atau isi jawaban.',
        errors: [{ code: 'MODEL_REFUSED', field: '', message: 'Model menolak memproses permintaan ini.' }],
      })
    }

    const textBlock = message.content.find((block) => block.type === 'text')

    if (!textBlock || textBlock.type !== 'text') {
      return res
        .status(502)
        .json({ message: 'Model tidak mengembalikan hasil analisis.' })
    }

    const parsed = JSON.parse(textBlock.text) as {
      summary: string
      recommendation: string
      ranking: unknown[]
    }

    const analysis = await prisma.formAnalysis.create({
      data: {
        formId: form.id,
        purpose: form.purpose,
        summary: parsed.summary,
        recommendation: parsed.recommendation,
        ranking: parsed.ranking as never,
      },
    })

    return sendSuccess(res, {
      status: 201,
      message: 'Analisis berhasil dibuat',
      data: {
        id: analysis.id,
        formId: analysis.formId,
        purpose: analysis.purpose,
        summary: analysis.summary,
        recommendation: analysis.recommendation,
        ranking: parsed.ranking,
        createdAt: analysis.createdAt.toISOString(),
      },
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error'
    return sendFailure(res, {
      status: 502,
      message: `Gagal menjalankan analisis AI: ${detail}`,
      errors: [{ code: 'ANALYSIS_FAILED', field: '', message: detail }],
    })
  }
}

export default withApi('analysis', handler)
