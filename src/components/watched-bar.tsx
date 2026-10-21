'use client'

import { useWatchedFraction } from '@/shared/lib/watchPreferences'

interface Props {
  videoId: string
}

// Bar merah di dasar thumbnail seperti YouTube: lebarnya sebanding bagian video yang sudah ditonton,
// penuh kalau video sudah selesai. Tidak tampil untuk video yang belum pernah diputar.
export default function WatchedBar({ videoId }: Props) {
  const fraction = useWatchedFraction(videoId)
  if (fraction <= 0) return null

  return (
    <div
      role="progressbar"
      aria-label="Sudah ditonton"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.max(1, Math.round(fraction * 100))}
      className="absolute inset-x-0 bottom-0 h-1 bg-white/35"
    >
      <div className="h-full bg-[#ff0033]" style={{ width: `${Math.max(fraction * 100, 4)}%` }} />
    </div>
  )
}
