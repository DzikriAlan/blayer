import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/shared/lib/auth'
import { deepseek } from '@/shared/lib/ai'
import { sendSuccess, sendError } from '@/shared/lib/apiResponse'

const SYSTEM_PROMPT = `Kamu adalah desainer AI agent. Berdasarkan permintaan pengguna, buat profil AI agent.
Kembalikan HANYA objek JSON dengan field berikut (tidak ada teks lain):
- name: nama agent singkat (2-4 kata, bahasa Indonesia)
- description: deskripsi singkat (maks 80 karakter)
- personalization: system prompt detail untuk AI agent (bahasa Indonesia, spesifik, instruktif)

Contoh output:
{"name":"Agen Sepak Bola","description":"Ahli sepak bola, statistik, dan berita terkini","personalization":"Kamu adalah asisten AI yang ahli dalam dunia sepak bola. Jawab pertanyaan tentang aturan, statistik pemain, sejarah pertandingan, dan berita terkini dengan akurat dan antusias."}`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`)
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return sendError(res, 401, 'UNAUTHORIZED', 'You must be signed in')
  }

  const { prompt } = req.body ?? {}
  if (!prompt?.trim()) return sendError(res, 400, 'BAD_REQUEST', 'Missing prompt')

  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content) as { name?: string; description?: string; personalization?: string }
    return sendSuccess(res, {
      name: parsed.name ?? '',
      description: parsed.description ?? '',
      personalization: parsed.personalization ?? '',
    })
  } catch (error) {
    console.error('Failed to generate agent', error)
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Gagal generate agent, coba lagi')
  }
}
