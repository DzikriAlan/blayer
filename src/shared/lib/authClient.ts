import { getSupabaseBrowser } from './supabaseBrowser'

/**
 * Header Authorization untuk request ke API sendiri.
 *
 * Endpoint yang menyimpan atau membaca data milik akun memeriksa token ini di
 * server, jadi service yang lupa memakainya akan dibalas 401 — bukan diam-diam
 * mengembalikan data orang lain.
 *
 * Token sengaja diambil per request, bukan disimpan di modul, supaya token yang
 * baru diperbarui Supabase selalu yang terpakai.
 */
export const getAuthHeaders = async () => {
  // Bentuknya dipatok Record<string, string> supaya hasil sebarannya masih
  // diterima sebagai HeadersInit walau tidak ada token.
  const headers: Record<string, string> = {}

  const client = getSupabaseBrowser()
  if (!client) return headers

  const { data } = await client.auth.getSession()
  const token = data.session?.access_token
  if (token) headers.Authorization = `Bearer ${token}`

  return headers
}
