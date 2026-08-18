import type {
  PayloadGetResponsesList,
  PayloadPostResponses,
} from '../types/responsesTypes'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export const postResponses = async (payload: PayloadPostResponses) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getResponsesList = async (payload: PayloadGetResponsesList) => {
  try {
    const res = await fetch(
      `${baseUrl}/api/v1/responses/list/${payload.formId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    )
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}
