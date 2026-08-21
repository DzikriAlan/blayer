import type {
  DataAnalysis,
  PayloadGetAnalysis,
  PayloadPostAnalysis,
} from '../types/analysisTypes'
import { getAuthHeaders } from '@/shared/lib/authClient'
import { throwApiError } from '@/shared/lib/httpError'
import { getApiData } from '@/shared/lib/apiClient'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export const getAnalysis = async (payload: PayloadGetAnalysis) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/analysis/${payload.formId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
    })
    if (!res.ok) await throwApiError(res)
    return getApiData<DataAnalysis | null>(res)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postAnalysis = async (payload: PayloadPostAnalysis) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/analysis/${payload.formId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const detail = await res.json().catch(() => null)
      throw new Error(detail?.message ?? res.statusText)
    }
    return getApiData<DataAnalysis | null>(res)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}
