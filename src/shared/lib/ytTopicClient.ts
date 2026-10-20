// Klien API yt-topic (lihat standards/RESPONSE.md untuk bentuk respons).
// Dipanggil langsung dari browser; alamatnya dari NEXT_PUBLIC_YT_TOPIC_API_URL.

export const ytTopicBaseUrl = (process.env.NEXT_PUBLIC_YT_TOPIC_API_URL || 'http://localhost:3500').replace(/\/$/, '')

export interface YtTopicPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface YtTopicEnvelope<T> {
  success: boolean
  data?: T
  message?: string
  pagination?: YtTopicPagination
  error?: { code: string; message: string; details: unknown } | null
}

export class YtTopicError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message)
    this.name = 'YtTopicError'
  }
}

export const getYtTopic = async <T>(path: string) => {
  let res: Response
  try {
    res = await fetch(`${ytTopicBaseUrl}${path}`, { headers: { accept: 'application/json' } })
  } catch {
    throw new YtTopicError('Server video tidak bisa dihubungi. Pastikan API yt-topic sedang berjalan.', 0, 'NETWORK_ERROR')
  }

  const body = (await res.json().catch(() => null)) as YtTopicEnvelope<T> | null
  if (!res.ok || !body?.success) {
    throw new YtTopicError(
      body?.error?.message ?? 'Terjadi kesalahan saat memuat video',
      res.status,
      body?.error?.code ?? 'UNKNOWN_ERROR',
    )
  }

  return body
}
