import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import LandingFacepile from './landingFacepile'

export interface LandingEvent {
  id: string
  title: string
  description: string
  image: string
  totalResponses: number
  totalFields: number
  tooltip: string
}

interface Props {
  event: LandingEvent
  actionLabel: string
  countLabel: string
  fieldLabel: string
  hasBanner?: boolean
  isFixedBanner?: boolean
  className?: string
}

export default function LandingPoster({
  event,
  actionLabel,
  countLabel,
  fieldLabel,
  hasBanner = true,
  isFixedBanner = false,
  className,
}: Props) {
  return (
    <article
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
          {event.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.image}
              alt={`Banner ${event.title}`}
              loading="lazy"
              className={cn(
                isFixedBanner
                  ? 'absolute inset-0 h-full w-full object-cover'
                  : 'relative block h-auto max-h-[22rem] w-full object-contain'
              )}
            />
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <h2
          title={event.tooltip}
          className="line-clamp-2 min-h-[2.5em] break-words font-display text-lg font-black uppercase leading-tight tracking-tight sm:text-xl"
        >
          {event.title}
        </h2>
        <p className="line-clamp-3 min-h-[4.875em] font-mono text-xs leading-relaxed text-muted-foreground">
          {event.description}
        </p>

        <div className="mt-auto flex min-w-0 items-center gap-x-2 overflow-hidden whitespace-nowrap">
          <LandingFacepile
            total={event.totalResponses}
            seed={event.id}
            label={countLabel}
          />
          <span className="brutal-eyebrow shrink-0 text-muted-foreground">
            · {String(event.totalFields).padStart(2, '0')} {fieldLabel}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <span className="brutal-eyebrow flex items-center gap-2 border-2 border-foreground px-3 py-2 transition-colors group-hover:bg-foreground group-hover:text-background">
            {actionLabel}
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  )
}
