// Slug bukan hal yang perlu dipikirkan pemakai: kalau tidak diisi, ia diturunkan
// dari namanya. Yang penting slug itu ada, unik di dalam project, dan aman
// dipakai di URL.
const MAX_LENGTH = 48

export const getSlugFromName = (name: string) => {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_LENGTH)
    .replace(/-+$/g, '')

  // Nama yang seluruhnya di luar a-z0-9 (mis. aksara lain atau emoji) tidak
  // menyisakan apa pun. Daripada menolak, beri slug yang tetap bisa dipakai.
  return base.length >= 3 ? base : `agent-${Date.now().toString(36).slice(-6)}`
}

export const getSlugCandidates = (name: string, slug?: string) => {
  const base = slug?.trim() ? slug.trim() : getSlugFromName(name)

  return [base, ...[2, 3, 4, 5].map((index) => `${base}-${index}`.slice(0, MAX_LENGTH))]
}

// Slug yang diketik sendiri tetap dihormati apa adanya; yang diturunkan dari
// nama boleh diberi akhiran angka supaya tidak bentrok.
export const getFreeSlug = async (
  candidates: string[],
  isTaken: (slug: string) => Promise<boolean>
) => {
  for (const candidate of candidates) {
    if (!(await isTaken(candidate))) return candidate
  }

  return null
}
