export const USERNAME_DOMAIN = 'blayer.id'

export const USERNAME_MIN = 3
export const USERNAME_MAX = 30
export const PASSWORD_MIN = 8

export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/

export const getNormalizedUsername = (username: string) =>
  username.trim().toLowerCase()

export const getEmailFromUsername = (username: string) =>
  `${getNormalizedUsername(username)}@${USERNAME_DOMAIN}`

export const getUsernameFromEmail = (email: string) =>
  email.endsWith(`@${USERNAME_DOMAIN}`) ? email.split('@')[0] : email

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const getLoginEmail = (input: string) => {
  const value = getNormalizedUsername(input)
  return value.includes('@') ? value : getEmailFromUsername(value)
}

export const getLoginProblem = (input: string) => {
  const value = getNormalizedUsername(input)

  if (!value) return 'Username atau email wajib diisi.'
  if (!value.includes('@')) return getUsernameProblem(value)
  if (!EMAIL_PATTERN.test(value)) return 'Alamat email itu belum lengkap.'

  return ''
}

export const getUsernameProblem = (username: string) => {
  const value = getNormalizedUsername(username)

  if (!value) return 'Username wajib diisi.'

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
