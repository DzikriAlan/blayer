import type { PayloadPostUploadsBanner } from '../types/uploadsTypes'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export const postUploadsBanner = async (
  payload: PayloadPostUploadsBanner
) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/uploads/banner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    // Pesan dari server ikut dibaca supaya alasan gagalnya sampai ke UI.
    const json = await res.json().catch(() => null)
    if (!res.ok) throw new Error(json?.message || res.statusText)
    return json
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}
