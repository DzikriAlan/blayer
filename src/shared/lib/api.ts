export interface ApiErrorBody {
  code: string
  message: string
  details?: unknown
}

export interface ApiPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiErrorBody
  pagination?: ApiPagination
  message?: string
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export const api = async <T = unknown>(
  method: HttpMethod,
  endpoint: string,
  payload?: unknown
): Promise<T> => {
  const options: RequestInit = { method, headers: { 'Content-Type': 'application/json' } }
  if (payload && method !== 'GET') options.body = JSON.stringify(payload)

  const res = await fetch(`/api${endpoint}`, options)
  const json = (await res.json()) as ApiResponse<T>

  if (!res.ok || !json.success) {
    throw new Error(json?.error?.message ?? json?.message ?? res.statusText)
  }

  return json.data as T
}

export const apiFetch = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  return fetch(`/api${endpoint}`, options)
}
