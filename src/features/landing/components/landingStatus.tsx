import { Check, Clock } from 'lucide-react'

import { LANDING_STATUS } from './landingCatalog'

// Design aslinya memakai ruang ini untuk cerita pelanggan. Blayer belum punya
// satu pun, jadi tempatnya dipakai untuk hal yang bisa dipertanggungjawabkan:
// apa yang sudah jalan, dan apa yang belum.
export default function LandingStatus() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {LANDING_STATUS.map((item) => {
        const isReady = item.state === 'jalan'
        const Icon = isReady ? Check : Clock

        return (
          <article
            key={item.id}
            className={
              isReady
                ? 'relative overflow-hidden rounded-xl border border-primary/40 p-6'
                : 'relative overflow-hidden rounded-xl border border-border bg-card p-6'
            }
          >
            {isReady ? (
              <>
                <span aria-hidden className="mesh pointer-events-none absolute inset-0" />
                <span
                  aria-hidden
                  className="noise pointer-events-none absolute inset-0 opacity-40"
                />
              </>
            ) : null}

            <div className="relative">
              <span
                className={
                  isReady
                    ? 'inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-[11px] uppercase tracking-wide text-white/90 backdrop-blur'
                    : 'inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground'
                }
              >
                <Icon className="h-3 w-3" />
                {isReady ? 'sudah jalan' : 'belum'}
              </span>

              <h3
                className={
                  isReady
                    ? 'mt-5 text-lg font-medium tracking-tight text-white'
                    : 'mt-5 text-lg font-medium tracking-tight'
                }
              >
                {item.title}
              </h3>
              <p
                className={
                  isReady
                    ? 'mt-2 text-sm leading-relaxed text-white/75'
                    : 'mt-2 text-sm leading-relaxed text-muted-foreground'
                }
              >
                {item.description}
              </p>
            </div>
          </article>
        )
      })}
    </div>
  )
}
