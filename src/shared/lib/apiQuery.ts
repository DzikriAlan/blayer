// Query string Next bisa datang sebagai array kalau kuncinya muncul dua kali.
// Rute hanya butuh satu nilai, jadi pembacaannya diseragamkan di sini.
export const getQueryId = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] ?? '') : (value ?? '')

export const getQueryLimit = (
  value: string | string[] | undefined,
  fallback = 20,
  max = 100
) => {
  const parsed = Number(getQueryId(value))

  return Number.isFinite(parsed)
    ? Math.min(Math.max(Math.trunc(parsed), 1), max)
    : fallback
}
