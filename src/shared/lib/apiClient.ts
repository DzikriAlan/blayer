import type { ApiPagination } from './apiResponse'

export interface ApiEnvelope<T> {
  success: boolean
  status: number
  message: string
  data: T
  meta: {
    request_id: string
    timestamp: string
    version: string
    pagination?: ApiPagination
  }
  errors: { code: string; field: string; message: string }[] | null
}

export const getApiData = async <T>(res: Response) => {
  const json = (await res.json()) as ApiEnvelope<T>
  return json.data
}

export const getApiPage = async <T>(res: Response) => {
  const json = (await res.json()) as ApiEnvelope<T[]>
  const pagination = json.meta?.pagination

  return {
    items: json.data ?? [],
    nextCursor: pagination?.next_cursor ?? null,
    hasMore: !!pagination?.has_more,
  }
}
