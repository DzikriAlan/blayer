import { fetchPages } from '@/shared/lib/fetchPages'
import type {
  DataResponses,
  DataResponsesList,
  DataResponsesListItem,
  PayloadGetResponsesList,
  PayloadPostResponses,
} from '../types/responsesTypes'
import { getAuthHeaders } from '@/shared/lib/authClient'
import { throwApiError } from '@/shared/lib/httpError'
import { getApiData } from '@/shared/lib/apiClient'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export const postResponses = async (payload: PayloadPostResponses) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) await throwApiError(res)
    return getApiData<DataResponses>(res)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getResponsesList = async (payload: PayloadGetResponsesList) => {
  const loadPage = async (cursor: string | null) => {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
    const res = await fetch(
      `${baseUrl}/api/v1/responses/list/${payload.formId}${query}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
      }
    )
    if (!res.ok) await throwApiError(res)

    const json = (await res.json()) as {
      data: DataResponsesList
      meta?: { pagination?: { next_cursor: string | null; has_more: boolean } }
    }

    return {
      ...json.data,
      nextCursor: json.meta?.pagination?.next_cursor ?? null,
      hasMore: !!json.meta?.pagination?.has_more,
    }
  }

  try {
    const first = await loadPage(null)

    const rest = first.hasMore
      ? await fetchPages<DataResponsesListItem>(async (cursor) => {
          const page = await loadPage(cursor ?? first.nextCursor)
          return {
            items: page.responses ?? [],
            nextCursor: page.nextCursor,
            hasMore: page.hasMore,
          }
        })
      : []

    return { ...first, responses: [...first.responses, ...rest] }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}
