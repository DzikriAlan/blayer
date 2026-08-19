import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { anthropic } from '@/shared/lib/anthropic'
import { getAuthGuard } from '@/shared/lib/authServer'

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { formId } = req.query

  // Baca maupun jalankan analisis sama-sama menuntut pemilik form. Selain soal
  // kerahasiaan jawaban, menjalankan analisis memanggil model berbayar — tanpa
  // pemeriksaan ini siapa pun bisa menagihkan biaya ke pemilik project.
  const user = await getAuthGuard(req, res)
  if (!user) return

  const owner = await prisma.form.findUnique({
    where: { id: String(formId) },
    select: { userId: true },
  })

  if (!owner) return res.status(404).json({ message: 'Form tidak ditemukan.' })

  if (owner.userId !== user.id) {
    return res
      .status(403)
      .json({ message: 'Form ini bukan milik akun yang sedang masuk.' })
  }

  // Ambil hasil analisis terakhir yang tersimpan, supaya dashboard tetap
  // berisi setelah halaman di-refresh tanpa harus menjalankan AI lagi.
  if (req.method === 'GET') {
    const analysis = await prisma.formAnalysis.findFirst({
      where: { formId: String(formId) },
      orderBy: { createdAt: 'desc' },
    })

    if (!analysis) return res.status(200).json(null)

    return res.status(200).json({
      id: analysis.id,
      formId: analysis.formId,
      purpose: analysis.purpose,
      summary: analysis.summary,
      recommendation: analysis.recommendation,
      ranking: analysis.ranking,
      createdAt: analysis.createdAt.toISOString(),
    })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  const form = await prisma.form.findUnique({
    where: { id: String(formId) },
    include: {
      fields: { orderBy: { order: 'asc' } },
      responses: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!form) return res.status(404).json({ message: 'Form tidak ditemukan.' })

  if (!form.purpose) {
    return res.status(400).json({
      message:
        'Form ini tidak mengaktifkan analisis AI. Tambahkan tujuan form terlebih dahulu.',
    })
  }

  if (!form.responses.length) {
    return res
      .status(400)
      .json({ message: 'Belum ada jawaban yang bisa dianalisis.' })
  }

  // Cek environment paling akhir: kondisi request yang salah harus dilaporkan
  // apa adanya, bukan tertutup oleh pesan konfigurasi server.
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
      return res.status(422).json({
        message:
          'Analisis ditolak oleh sistem keamanan model. Coba sesuaikan tujuan form atau isi jawaban.',
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

    return res.status(201).json({
      id: analysis.id,
      formId: analysis.formId,
      purpose: analysis.purpose,
      summary: analysis.summary,
      recommendation: analysis.recommendation,
      ranking: parsed.ranking,
      createdAt: analysis.createdAt.toISOString(),
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error'
    return res
      .status(502)
      .json({ message: `Gagal menjalankan analisis AI: ${detail}` })
  }
}
