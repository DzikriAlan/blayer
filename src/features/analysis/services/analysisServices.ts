import type {
  PayloadGetAnalysis,
  PayloadPostAnalysis,
} from '../types/analysisTypes'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export const getAnalysis = async (payload: PayloadGetAnalysis) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/analysis/${payload.formId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postAnalysis = async (payload: PayloadPostAnalysis) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/analysis/${payload.formId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const detail = await res.json().catch(() => null)
      throw new Error(detail?.message ?? res.statusText)
    }
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}
