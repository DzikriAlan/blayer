import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Badge } from '@/components/ui/badge'
import FormsFacepile from './formsFacepile'

export interface FormsPosterForm {
  id: string
  slug: string
  title: string
  description: string
  image: string
  isPaid: boolean
  priceText: string
  totalResponses: number
  totalFields: number
  tooltip: string
  tags: string[]
}

interface Props {
  form: FormsPosterForm
  actionLabel: string
  countLabel: string
  fieldLabel: string
  hasBanner?: boolean
  hasPriceBadge?: boolean
  isFixedBanner?: boolean
  className?: string
}

export default function FormsPoster({
  form,
  actionLabel,
  countLabel,
  fieldLabel,
  hasBanner = true,
  hasPriceBadge = false,
  isFixedBanner = false,
  className,
}: Props) {
  return (
    <Link
      href={form.slug ? `/f/${form.slug}` : `/forms/${form.id}`}
      className={cn(
        'group flex flex-col border-2 border-foreground bg-paper transition-shadow hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]',
        className
      )}
    >
      {hasBanner ? (
        <div
          className={cn(
            'relative w-full overflow-hidden border-b-2 border-foreground bg-muted',
            isFixedBanner ? 'h-32 sm:h-44' : 'min-h-32'
          )}
        >
          <span aria-hidden className="brutal-hatch absolute inset-0 opacity-20" />
          {form.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.image}
              alt={`Banner ${form.title}`}
              loading="lazy"
              className={cn(
                isFixedBanner
                  ? 'absolute inset-0 h-full w-full object-cover'
                  : 'relative block h-auto max-h-[22rem] w-full object-contain'
              )}
            />
          ) : null}
          {form.isPaid ? (
            <span className="brutal-eyebrow absolute left-0 top-0 bg-foreground px-3 py-2 text-background">
              {form.priceText}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <h2
          title={form.tooltip}
          className="line-clamp-2 min-h-[2.5em] break-words font-display text-lg font-black uppercase leading-tight tracking-tight sm:text-xl"
        >
          {form.title}
        </h2>
        <p className="line-clamp-3 min-h-[4.875em] font-mono text-xs leading-relaxed text-muted-foreground">
          {form.description}
        </p>

        <div className="mt-auto flex min-w-0 items-center gap-x-2 overflow-hidden whitespace-nowrap">
          <FormsFacepile
            total={form.totalResponses}
            seed={form.id}
            label={countLabel}
          />
          <span className="brutal-eyebrow shrink-0 text-muted-foreground">
            · {String(form.totalFields).padStart(2, '0')} {fieldLabel}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          {hasPriceBadge ? (
            <Badge variant="outline">{form.priceText}</Badge>
          ) : (
            <span />
          )}
          <span className="brutal-eyebrow flex items-center gap-2 border-2 border-foreground px-3 py-2 transition-colors group-hover:bg-foreground group-hover:text-background">
            {actionLabel}
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
