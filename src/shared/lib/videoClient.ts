// Klien API video milik blayer sendiri (server/features/videos), bentuk
// responsnya mengikuti standards/RESPONSE.md.

export interface VideoApiPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface VideoApiEnvelope<T> {
  success: boolean
  data?: T
  message?: string
  pagination?: VideoApiPagination
  error?: { code: string; message: string; details: Record<string, string[]> | null } | null
}

export class VideoApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message)
    this.name = 'VideoApiError'
  }
}

export const getVideoApi = async <T>(path: string) => {
  let res: Response
  try {
    res = await fetch(`/api/v1/videos${path}`, { headers: { accept: 'application/json' } })
  } catch {
    throw new VideoApiError('Server tidak bisa dihubungi. Periksa koneksi internetmu.', 0, 'NETWORK_ERROR')
  }

  const body = (await res.json().catch(() => null)) as VideoApiEnvelope<T> | null
  if (!res.ok || !body?.success) {
    const detail = Object.values(body?.error?.details ?? {})[0]?.[0]
    throw new VideoApiError(
      detail ?? body?.error?.message ?? 'Terjadi kesalahan saat memuat video',
      res.status,
      body?.error?.code ?? 'UNKNOWN_ERROR',
    )
  }

  return body
}
