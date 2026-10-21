'use client'

import { useMemo } from 'react'
import { ListVideo } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { postAutoplayNext, useAutoplayNext } from '@/shared/lib/watchPreferences'

interface Props {
  className?: string
}

// Tombol ikon tanpa border di samping toggle tema: saat aktif, video berikutnya diputar otomatis
// begitu video yang sedang ditonton selesai. Pilihan disimpan di localStorage.
export default function AutoplayToggle({ className }: Props) {
  const isOn = useAutoplayNext()

  const data = useMemo(
    () => ({
      isOn,
      label: isOn ? 'Putar otomatis aktif, klik untuk mematikan' : 'Putar otomatis video berikutnya',
    }),
    [isOn],
  )

  const editAutoplay = () => {
    postAutoplayNext(!data.isOn)
  }

  return (
    <button
      type="button"
      onClick={editAutoplay}
      aria-pressed={data.isOn}
      aria-label={data.label}
      title={data.label}
      className={cn(
        'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        data.isOn ? 'text-primary' : 'text-foreground',
        className,
      )}
    >
      <ListVideo className="h-5 w-5" />
      {data.isOn ? <span aria-hidden className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" /> : null}
    </button>
  )
}
