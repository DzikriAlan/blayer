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

/** Mengembalikan alasan penolakan, atau string kosong bila sudah sah. */
export const getUsernameProblem = (username: string) => {
  const value = getNormalizedUsername(username)

  if (!value) return 'Username wajib diisi.'
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
