const TOKEN_KEY = 'blayer.console.token'

// Token pengelolaan hanya hidup di browser operator. Tidak ada sesi server,
// tidak ada cookie — instance self-hosted tidak perlu menyimpan siapa pun.
export const getConsoleToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

export const setConsoleToken = (token: string) => {
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Penyimpanan browser bisa ditolak (mode privat). Token tetap dipakai
    // selama tab ini hidup lewat state di memori.
  }
}

export const clearConsoleToken = () => {
  try {
    window.localStorage.removeItem(TOKEN_KEY)
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

export const consoleFetch = async <T>(
  path: string,
  init: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getConsoleToken()}`,
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
