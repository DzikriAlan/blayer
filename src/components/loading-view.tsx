import { Loader2 } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  title: string
  subtitle: string
  /** Jumlah balok pratinjau di bawah panel; 0 berarti panel saja. */
  lines?: number
  className?: string
}

/**
 * Pasangan StatusView untuk keadaan memuat.
 *
 * Balok abu-abu saja terbaca seperti halaman rusak, jadi bentuk yang sedang
 * disiapkan tetap ditunjukkan — tapi didahului ikon berputar dan keterangan
 * yang menyebut apa yang sedang dimuat.
 */
export default function LoadingView({
  title,
  subtitle,
  lines = 2,
  className,
}: Props) {
  const getLineList = () => Array.from({ length: lines }, (_, index) => index)

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="border-2 border-foreground bg-paper">
        <div className="flex items-stretch gap-3 border-b-2 border-foreground bg-foreground px-5 py-3 text-background sm:px-7">
          <span className="brutal-eyebrow flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> MEMUAT
          </span>
          <span
            aria-hidden
            className="brutal-hatch brutal-hatch-run flex-1 opacity-40"
          />
        </div>

        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center"
        >
          <Loader2 className="h-9 w-9 animate-spin text-primary" />
          <p className="font-display text-2xl font-black uppercase leading-none tracking-tight">
            {title}
          </p>
          <p className="max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      {getLineList().map((line) => (
        <Skeleton key={line} className="mt-[-2px] h-24 w-full" />
      ))}
    </div>
  )
}
