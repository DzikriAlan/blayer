import { getSupabaseBrowser } from './supabaseBrowser'

export const getAuthHeaders = async () => {
  const headers: Record<string, string> = {}

  const client = getSupabaseBrowser()
  if (!client) return headers

  const { data } = await client.auth.getSession()
  const token = data.session?.access_token
  if (token) headers.Authorization = `Bearer ${token}`

  return headers
}
