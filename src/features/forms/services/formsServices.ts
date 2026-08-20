import { fetchPages } from '@/shared/lib/fetchPages'
import type {
  DataFormsPublic,
  PayloadDeleteForms,
  PayloadGetFormsDetail,
  PayloadPostForms,
  PayloadPutForms,
} from '../types/formsTypes'
import { getAuthHeaders } from '@/shared/lib/authClient'
import { throwApiError } from '@/shared/lib/httpError'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export const getForms = async () => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/forms`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
    })
    if (!res.ok) await throwApiError(res)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getFormsPublic = async () => {
  try {
    // Tanpa header Authorization: katalog ini memang dibaca pengunjung yang
    // belum punya akun.
    return await fetchPages<DataFormsPublic>(async (cursor) => {
      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
      const res = await fetch(`${baseUrl}/api/v1/forms/public${query}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) await throwApiError(res)
      return res.json()
    })
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
    if (!res.ok) await throwApiError(res)
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
    if (!res.ok) await throwApiError(res)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const putForms = async ({ id, ...payload }: PayloadPutForms) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/forms/detail/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) await throwApiError(res)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const deleteForms = async (payload: PayloadDeleteForms) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/forms/detail/${payload.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeaders()),
      },
    })
    if (!res.ok) await throwApiError(res)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}
