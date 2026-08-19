import type {
  PayloadGetFormsDetail,
  PayloadPostForms,
} from '../types/formsTypes'
import { getAuthHeaders } from '@/shared/lib/authClient'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export const getForms = async () => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/forms`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postForms = async (payload: PayloadPostForms) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getFormsDetail = async (payload: PayloadGetFormsDetail) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/forms/detail/${payload.id}`, {
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
