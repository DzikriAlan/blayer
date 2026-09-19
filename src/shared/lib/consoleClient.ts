const SESSION_KEY = 'blayer.console.session'

export interface ConsoleSession {
  token: string
  username: string
  expiresAt: string
}

// Sesi hanya hidup di browser operator. Tidak ada cookie dan tidak ada sesi yang
// disimpan server — tokennya sudah bertanda tangan dan berbatas waktu sendiri.
export const getConsoleSession = (): ConsoleSession | null => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<ConsoleSession>

    if (!parsed.token || !parsed.expiresAt) return null
    if (Date.parse(parsed.expiresAt) <= Date.now()) return null

    return {
      token: parsed.token,
      username: parsed.username ?? '',
      expiresAt: parsed.expiresAt,
    }
  } catch {
    return null
  }
}

export const setConsoleSession = (session: ConsoleSession) => {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Penyimpanan browser bisa ditolak (mode privat). Sesi tetap dipakai selama
    // tab ini hidup lewat state di memori.
  }
}

export const clearConsoleSession = () => {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // sama seperti di atas: kegagalan menghapus tidak boleh menjatuhkan UI
  }
}

interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  data?: T
  errors?: { code?: string; field?: string; message?: string }[] | null
}

const getErrorMessage = <T>(payload: ApiEnvelope<T>, status: number) => {
  const first = payload.errors?.[0]

  return first?.message || payload.message || `Permintaan gagal (${status}).`
}

interface ConsoleFetchOptions extends RequestInit {
  // Rute login dipanggil justru saat belum ada sesi, jadi header Authorization
  // tidak perlu ikut.
  isPublic?: boolean
}

export const consoleFetch = async <T>(
  path: string,
  { isPublic = false, ...init }: ConsoleFetchOptions = {}
): Promise<T> => {
  const session = isPublic ? null : getConsoleSession()

  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(init.headers ?? {}),
    },
  })

  let payload: ApiEnvelope<T> = {}

  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch {
    throw new Error(`Jawaban server tidak terbaca (${response.status}).`)
  }

  if (!response.ok || !payload.success) {
    throw new Error(getErrorMessage(payload, response.status))
  }

  return payload.data as T
}
