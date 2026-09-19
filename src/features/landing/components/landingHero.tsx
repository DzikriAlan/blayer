import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LANDING_STATS, LANDING_STEPS } from './landingCatalog'

const TAGLINES = ['AI Agent Platform', 'Control Plane', 'Self-hosted']

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <span
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-60"
      />
      <span
        aria-hidden
        className="glow pointer-events-none absolute -top-40 left-1/2 -z-10 h-[34rem] w-[46rem] -translate-x-1/2 blur-2xl"
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="rotator">
              <span aria-hidden className="rotator-track">
                {[...TAGLINES, TAGLINES[0]].map((tagline, index) => (
                  <span key={`${tagline}-${index}`}>{tagline}</span>
                ))}
              </span>
            </span>
            <span className="sr-only">{TAGLINES.join(' — ')}</span>
          </span>

          <h1 className="mt-7 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Build excellent AI agent,{' '}
            <span className="text-primary">your way.</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Blayer mengatur AI, project menguasai data. Prompt, model, versi, dan
            catatan pemakaiannya hidup di sini — data bisnismu tetap di
            infrastrukturmu sendiri.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/console">
                Masuk Console <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="#cara-kerja">Lihat Cara Kerjanya</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-4xl">
          <span
            aria-hidden
            className="glow-soft pointer-events-none absolute -inset-x-10 -bottom-10 -top-6 -z-10 blur-xl"
          />

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lift">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
              <span className="text-sm font-medium">Dari nol sampai dipanggil</span>
              <span className="text-xs text-muted-foreground">
                {LANDING_STEPS.length} langkah
              </span>
            </div>

            <ol className="grid sm:grid-cols-2">
              {LANDING_STEPS.map((step, index) => {
                const Icon = step.icon

                return (
                  <li
                    key={step.id}
                    className="flex gap-4 border-b border-border p-5 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-child(odd)]:border-r"
                  >
                    <span className="index-badge">
                      <Icon className="h-4 w-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{step.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>

        <dl className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
          {LANDING_STATS.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.key}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4"
              >
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {stat.label}
                  </dt>
                  <dd className="mt-1.5 text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </dd>
                </div>
                <Icon aria-hidden className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}
