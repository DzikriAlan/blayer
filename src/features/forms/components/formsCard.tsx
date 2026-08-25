import Link from 'next/link'
import { ArrowUpRight, BarChart3, Loader2, Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Props {
  index: number
  id: string
  title: string
  status: string
  totalFields: number
  totalResponses: number
  createdAt: string
  isDeleting?: boolean
  onClearForms?: (id: string) => void
}

export default function FormsCard({
  index,
  id,
  title,
  status,
  totalFields,
  totalResponses,
  createdAt,
  isDeleting = false,
  onClearForms,
}: Props) {
  return (
    <article className="group border-b-2 border-foreground bg-paper px-4 py-5 transition-colors hover:bg-muted sm:px-7 sm:py-6">
      <div className="flex items-start gap-3 sm:gap-6">
        <span className="brutal-index h-8 w-8 text-xs group-hover:bg-primary sm:h-9 sm:w-9 sm:text-sm">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <h3 className="min-w-0 break-words font-display text-lg font-black uppercase leading-none tracking-tight sm:text-2xl">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status === 'LIVE' ? 'secondary' : 'outline'}>
              {status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:pl-[3.75rem]">
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:gap-x-5 sm:gap-y-2">
          <span className="brutal-eyebrow">{totalFields} FIELDS</span>
          <span aria-hidden className="hidden h-3 w-px bg-foreground/30 sm:block" />
          <span className="brutal-eyebrow">{totalResponses} RESPONSES</span>
          <span aria-hidden className="hidden h-3 w-px bg-foreground/30 sm:block" />
          <span className="brutal-eyebrow text-muted-foreground">
            {createdAt}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
          <Button asChild size="sm" variant="outline" className="w-9 px-0 sm:w-auto sm:px-4">
            <Link href={`/forms/${id}`} aria-label={`Buka form ${title}`}>
              <ArrowUpRight />
            </Link>
          </Button>
          <Button asChild size="sm" className="w-9 px-0 sm:w-auto sm:px-4">
            <Link href={`/forms/${id}/result`} aria-label={`Lihat hasil ${title}`}>
              <BarChart3 />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="w-9 px-0 sm:w-auto sm:px-4">
            <Link href={`/forms/${id}/edit`} aria-label={`Sunting form ${title}`}>
              <Pencil />
            </Link>
          </Button>
          {onClearForms ? (
            <Button
              size="sm"
              variant="outline"
              className="w-9 px-0 sm:w-auto sm:px-4"
              disabled={isDeleting}
              aria-label={`Hapus form ${title}`}
              onClick={() => onClearForms(id)}
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
