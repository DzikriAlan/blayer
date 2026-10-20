// Format angka dan waktu video dalam bahasa Indonesia, dipakai beranda dan halaman tonton

const compactFormatter = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 })
const fullFormatter = new Intl.NumberFormat('id-ID')

// 19264 -> "19,3 rb", 1170000 -> "1,2 jt"
export const getCompactCount = (value: number) => compactFormatter.format(value || 0)

// 19264 -> "19.264"
export const getFullCount = (value: number) => fullFormatter.format(value || 0)

// YouTube berbahasa Indonesia menulis durasi dengan titik ("26.44", "1.02.33")
export const getDurationLabel = (duration: string) => duration.replace(/\./g, ':')

// 1604 -> "26:44", 3753 -> "1:02:33"
export const getSecondsLabel = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}

// "2026-10-19T17:15:24-07:00" -> "20 Oktober 2026"
export const getPublishLabel = (isoDate: string) => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
