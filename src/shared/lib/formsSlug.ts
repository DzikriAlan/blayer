export const SLUG_MAX_LENGTH = 60
export const SLUG_MIN_LENGTH = 3

export const RESERVED_SLUGS = [
  'api',
  'auth',
  'f',
  'forms',
  'kategori',
  'login',
  'register',
  'privacy',
  'akun',
  'new',
  'edit',
  'result',
]

export const getSlugged = (value: string) =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\[demo\]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, '')

export const getSlugError = (slug: string) => {
  if (!slug) return 'Tautan wajib diisi.'
  if (slug.length < SLUG_MIN_LENGTH) {
    return `Tautan minimal ${SLUG_MIN_LENGTH} karakter.`
  }
  if (slug.length > SLUG_MAX_LENGTH) {
    return `Tautan maksimal ${SLUG_MAX_LENGTH} karakter.`
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Tautan hanya boleh berisi huruf kecil, angka, dan tanda hubung.'
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return `Tautan "${slug}" sudah dipakai sistem.`
  }
  return ''
}

export const getSlugCandidates = (title: string, fallback: string) => {
  const base = getSlugged(title) || getSlugged(fallback) || 'form'
  const seed = base.length >= SLUG_MIN_LENGTH ? base : `form-${base}`.slice(0, SLUG_MAX_LENGTH)

  const getSuffixed = (suffix: string) =>
    `${seed.slice(0, SLUG_MAX_LENGTH - suffix.length - 1)}-${suffix}`

  return [
    seed,
    ...Array.from({ length: 4 }, (_item, index) => getSuffixed(String(index + 2))),
    getSuffixed(fallback.slice(-6).toLowerCase()),
  ].filter((candidate) => !getSlugError(candidate))
}
