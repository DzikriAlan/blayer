/**
 * Aturan username, dipakai bersama oleh browser dan API route.
 *
 * Supabase Auth hanya mengenal email untuk login berkata sandi, sedangkan
 * produk ini memakai username. Username diubah jadi alamat internal di satu
 * tempat ini supaya bentuknya tidak pernah berbeda antara saat mendaftar dan
 * saat masuk — beda satu karakter saja akan terbaca sebagai akun lain.
 */

export const USERNAME_DOMAIN = 'blayer.id'

export const USERNAME_MIN = 3
export const USERNAME_MAX = 30
export const PASSWORD_MIN = 8

// Huruf, angka, titik, garis bawah, dan strip. Sengaja tanpa spasi dan tanpa
// "@" supaya tidak bentrok dengan bentuk alamat email.
export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/

export const getNormalizedUsername = (username: string) =>
  username.trim().toLowerCase()

export const getEmailFromUsername = (username: string) =>
  `${getNormalizedUsername(username)}@${USERNAME_DOMAIN}`

export const getUsernameFromEmail = (email: string) =>
  email.endsWith(`@${USERNAME_DOMAIN}`) ? email.split('@')[0] : email

// Cukup untuk menahan alamat yang jelas belum selesai diketik. Sengaja longgar:
// penentu sahnya sebuah alamat adalah Supabase, bukan pola di sini.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Alamat yang dipakai untuk masuk, dari isian yang boleh berupa username
 * maupun alamat email.
 *
 * Isian yang sudah berbentuk alamat diteruskan apa adanya. Menempelkan domain
 * ke isian yang sudah punya "@" akan menghasilkan alamat ganda seperti
 * `nama@blayer.id@blayer.id`, dan akun dengan email sungguhan — mis. lewat
 * Google — tidak akan pernah ketemu kalau domainnya dipaksakan.
 */
export const getLoginEmail = (input: string) => {
  const value = getNormalizedUsername(input)
  return value.includes('@') ? value : getEmailFromUsername(value)
}

/** Aturan kolom login, yang menerima username maupun alamat email. */
export const getLoginProblem = (input: string) => {
  const value = getNormalizedUsername(input)

  if (!value) return 'Username atau email wajib diisi.'
  if (!value.includes('@')) return getUsernameProblem(value)
  if (!EMAIL_PATTERN.test(value)) return 'Alamat email itu belum lengkap.'

  return ''
}

/** Mengembalikan alasan penolakan, atau string kosong bila sudah sah. */
export const getUsernameProblem = (username: string) => {
  const value = getNormalizedUsername(username)

  if (!value) return 'Username wajib diisi.'

  // Mengisi alamat email lengkap adalah salah ketik yang paling sering terjadi,
  // karena kolomnya mirip kolom login di mana pun. Tanpa cabang ini pengguna
  // hanya diberi tahu bahwa "@" tidak boleh, padahal yang perlu ia tahu adalah
  // domainnya ditempelkan otomatis dan cukup dibuang dari isian.
  if (value.includes('@')) {
    const [name, ...rest] = value.split('@')
    const domain = rest.join('@')

    if (domain === USERNAME_DOMAIN)
      return `Cukup username-nya saja, tanpa @${USERNAME_DOMAIN}. Isi "${name}".`

    return `Isi username, bukan alamat email. Untuk ${value}, username-nya "${name}".`
  }

  if (value.length < USERNAME_MIN)
    return `Username minimal ${USERNAME_MIN} karakter.`
  if (value.length > USERNAME_MAX)
    return `Username maksimal ${USERNAME_MAX} karakter.`
  if (!USERNAME_PATTERN.test(value))
    return 'Username hanya boleh huruf, angka, titik, garis bawah, dan strip.'

  return ''
}

export const getPasswordProblem = (password: string) => {
  if (!password) return 'Kata sandi wajib diisi.'
  if (password.length < PASSWORD_MIN)
    return `Kata sandi minimal ${PASSWORD_MIN} karakter.`

  return ''
}
