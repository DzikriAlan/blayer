import Link from 'next/link'
import { ArrowUpRight, BarChart3 } from 'lucide-react'

import { IS_AI_VISIBLE } from '@/shared/lib/features'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Props {
  index: number
  id: string
  title: string
  purpose: string
  isAiEnabled: boolean
  status: string
  totalField: number
  totalResponse: number
  createdAt: string
}

export default function FormsCard({
  index,
  id,
  title,
  purpose,
  isAiEnabled,
  status,
  totalField,
  totalResponse,
  createdAt,
}: Props) {
  return (
    <article className="group border-b-2 border-foreground bg-paper px-5 py-6 transition-colors hover:bg-muted sm:px-7">
      {/* Baris 1: nomor urut + judul + status. */}
      <div className="flex items-start gap-4 sm:gap-6">
        <span className="brutal-index group-hover:bg-primary">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <h3 className="min-w-0 break-words font-display text-2xl font-black uppercase leading-none tracking-tight">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {IS_AI_VISIBLE ? (
              <Badge variant={isAiEnabled ? 'default' : 'muted'}>
                {isAiEnabled ? 'AI ON' : 'AI OFF'}
              </Badge>
            ) : null}
            <Badge variant={status === 'LIVE' ? 'secondary' : 'outline'}>
              {status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Baris 2: di mobile pakai lebar penuh supaya tombol tidak menumpuk;
          di layar sedang ke atas disejajarkan dengan judul. */}
      <div className="mt-4 sm:pl-[3.75rem]">
        {IS_AI_VISIBLE && isAiEnabled ? (
          <p className="line-clamp-2 max-w-xl font-mono text-xs leading-relaxed text-muted-foreground">
            <span className="text-primary">{'>> '}</span>
            {purpose}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="brutal-eyebrow">{totalField} FIELDS</span>
          <span aria-hidden className="h-3 w-px bg-foreground/30" />
          <span className="brutal-eyebrow">{totalResponse} RESPONSES</span>
          <span aria-hidden className="h-3 w-px bg-foreground/30" />
          <span className="brutal-eyebrow text-muted-foreground">
            {createdAt}
          </span>
        </div>

        {/* Dua aksi wajib per form: buka formnya, dan buka dashboard hasilnya. */}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={`/forms/${id}`}>
              <ArrowUpRight />
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/forms/${id}/result`}>
              <BarChart3 />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
