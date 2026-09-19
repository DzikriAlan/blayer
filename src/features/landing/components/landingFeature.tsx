import { cn } from '@/shared/lib/utils'
import { LANDING_FEATURES } from './landingCatalog'

const SPAN_CLASS: Record<1 | 2 | 3, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
}

export default function LandingFeature() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {LANDING_FEATURES.map((feature) => {
        const Icon = feature.icon
        const isWide = feature.span > 1

        return (
          <li
            key={feature.id}
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40',
              SPAN_CLASS[feature.span],
              feature.span === 3 && 'sm:col-span-2'
            )}
          >
            {isWide ? (
              <>
                <span aria-hidden className="mesh-soft absolute inset-0 opacity-70" />
                <span
                  aria-hidden
                  className="noise pointer-events-none absolute inset-0 opacity-30"
                />
              </>
            ) : (
              <span
                aria-hidden
                className="glow-soft pointer-events-none absolute -right-16 -top-16 h-40 w-40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}

            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="index-badge">
                  <Icon className="h-4 w-4" />
                </span>

                {feature.isReady ? null : (
                  <span className="rounded-full border border-border bg-background/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                    Sedang dibangun
                  </span>
                )}
              </div>

              <h3
                className={cn(
                  'mt-5 font-medium tracking-tight',
                  isWide ? 'text-xl' : 'text-lg'
                )}
              >
                {feature.title}
              </h3>

              <p
                className={cn(
                  'mt-2.5 text-sm leading-relaxed text-muted-foreground',
                  isWide && 'max-w-xl'
                )}
              >
                {feature.description}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
