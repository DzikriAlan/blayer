import type { NextApiRequest, NextApiResponse } from 'next'
import { withApi } from '@/shared/lib/apiHandler'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import {
  getSupabaseSetupMessage,
  isSupabaseReady,
  supabase,
} from '@/shared/lib/supabase'
import {
  getEmailFromUsername,
  getNormalizedUsername,
  getPasswordProblem,
  getUsernameProblem,
} from '@/shared/lib/authIdentity'

/**
 * Pendaftaran dijalankan di server memakai secret key, bukan `signUp()` dari
 * browser.
 *
 * Alasannya alamat email di sini sintetis (`username@blayer.id`) sehingga tautan
 * konfirmasi tidak akan pernah sampai. Lewat Admin API akun bisa langsung
 * ditandai terkonfirmasi, jadi pengguna bisa masuk begitu selesai mendaftar
 * tanpa perlu mematikan konfirmasi email untuk seluruh project.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  // Pendaftaran terbuka untuk siapa saja, jadi tanpa batas ini satu skrip
  // bisa membuat ribuan akun dan menghabiskan kuota Supabase.
  if (
    !(await enforceRateLimit(req, res, {
      name: 'auth-register',
      limit: 5,
      windowMs: 10 * 60_000,
    }))
  ) {
    return
  }

  if (!isSupabaseReady || !supabase) {
    return res.status(503).json({ message: getSupabaseSetupMessage() })
  }

  const { username, password } = req.body as {
    username?: string
    password?: string
  }

  const problem =
    getUsernameProblem(username ?? '') || getPasswordProblem(password ?? '')

  if (problem) return res.status(400).json({ message: problem })

  const name = getNormalizedUsername(username ?? '')

  const { data, error } = await supabase.auth.admin.createUser({
    email: getEmailFromUsername(name),
    password,
    email_confirm: true,
    user_metadata: { username: name, full_name: name },
  })

  if (error) {
    // Supabase menyebut bentrok akun dengan beberapa kalimat berbeda; semuanya
    // diterjemahkan jadi satu pesan yang bisa ditindaklanjuti pendaftar.
    const isTaken =
      error.status === 422 ||
      /already|exist|registered/i.test(error.message ?? '')

    return res.status(isTaken ? 409 : 500).json({
      message: isTaken
        ? 'Username itu sudah dipakai. Coba username lain.'
        : error.message || 'Pendaftaran gagal. Coba lagi sebentar lagi.',
    })
  }

  return res.status(201).json({ id: data.user?.id ?? '', username: name })
}

export default withApi('auth-register', handler)
