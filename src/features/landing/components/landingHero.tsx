import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LANDING_STATS, LANDING_STEPS } from './landingCatalog'

const TAGLINES = ['AI Agent Platform', 'Control Plane', 'Self-Hosted']

// Sudut kanan panel dan bilah statistik dipangkas miring. Sudut yang sama
// dipakai dua lapis — lapisan hitam di luar jadi garis tepinya, lapisan isi
// di dalam menyisakan garis itu tetap terlihat di sepanjang potongannya.
const CHAMFER =
  'polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 26px 100%, 0 calc(100% - 26px))'

export default function LandingHero() {
  return (
    <section className="relative flex flex-col overflow-hidden border-b-2 border-foreground bg-paper lg:min-h-[calc(100svh-4.4rem)]">
      <span
        aria-hidden
        className="brutal-dots pointer-events-none absolute left-0 top-10 hidden h-44 w-32 opacity-40 lg:block"
      />

      <svg
        aria-hidden
        viewBox="0 0 200 300"
        className="pointer-events-none absolute bottom-0 left-0 hidden h-[19rem] w-52 text-foreground lg:block"
        fill="currentColor"
      >
        <path d="M0 0h40v40H0zM0 40h80v40H0zM0 80h120v40H0zM0 120h200v180H0z" />
      </svg>

      <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div>
          <span className="brutal-eyebrow inline-block border-2 border-foreground bg-primary px-3 py-2 text-primary-foreground shadow-[5px_5px_0_0_hsl(var(--foreground))]">
            <span className="brutal-rotator">
              <span aria-hidden className="brutal-rotator-track">
                {[...TAGLINES, TAGLINES[0]].map((tagline, index) => (
                  <span key={`${tagline}-${index}`}>{tagline}</span>
                ))}
              </span>
            </span>
            <span className="sr-only">{TAGLINES.join(' — ')}</span>
          </span>

          <h1 className="mt-7 hyphens-auto break-words font-display text-[clamp(2.25rem,5.6vw,4rem)] font-black uppercase leading-[0.86] tracking-[-0.03em]">
            Satu tempat
            <br />
            atur semua agent
            <span className="text-primary">.</span>
          </h1>

          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-foreground/80">
            Blayer mengatur AI, project menguasai data. Prompt, model, versi, dan
            catatan pemakaiannya hidup di sini — data bisnismu tetap di
            infrastrukturmu sendiri.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/console">
                Masuk Console <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#cara-kerja">Lihat Cara Kerjanya</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <span
            aria-hidden
            className="brutal-hatch absolute -top-8 right-14 hidden h-5 w-28 lg:block"
          />

          <div className="bg-foreground p-[3px]" style={{ clipPath: CHAMFER }}>
            <div className="bg-background" style={{ clipPath: CHAMFER }}>
              <div className="flex items-center justify-between gap-3 border-b-2 border-foreground bg-foreground px-4 py-2.5 text-background sm:px-5 sm:py-3">
                <span className="brutal-eyebrow text-[10px] tracking-[0.14em] sm:text-[11px] sm:tracking-[0.18em]">
                  DARI NOL SAMPAI DIPANGGIL
                </span>
                <span className="brutal-eyebrow whitespace-nowrap text-[10px] tracking-[0.14em] opacity-70 sm:text-[11px] sm:tracking-[0.18em]">
                  {String(LANDING_STEPS.length).padStart(2, '0')} LANGKAH
                </span>
              </div>

              <ol>
                {LANDING_STEPS.map((step, index) => {
                  const Icon = step.icon

                  return (
                    <li
                      key={step.id}
                      className="flex items-center gap-2.5 border-b-2 border-foreground px-3.5 py-3 last:border-b-0 sm:gap-4 sm:px-5 sm:py-3.5"
                    >
                      <span className="brutal-index h-8 w-8 shrink-0 sm:h-10 sm:w-10">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block break-words font-display text-[15px] font-black uppercase leading-tight tracking-tight sm:text-lg">
                          {step.title}
                        </span>
                        <span className="mt-1 block font-mono text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                          {step.description}
                        </span>
                      </span>

                      <span className="brutal-eyebrow shrink-0 text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl items-end gap-5 px-5 pb-8 sm:px-8 sm:pb-10">
        <div className="relative flex-1">
          {/* clip-path ikut memotong box-shadow, jadi bayangannya digambar
              sebagai lapisan tersendiri yang dipotong dengan sudut yang sama */}
          <span
            aria-hidden
            className="absolute inset-0 translate-x-2.5 translate-y-2.5 bg-foreground"
            style={{ clipPath: CHAMFER }}
          />

          <dl
            className="relative grid border-2 border-foreground bg-paper sm:grid-cols-3"
            style={{ clipPath: CHAMFER }}
          >
            {LANDING_STATS.map((stat, index) => {
              const Icon = stat.icon
              const isPrimary = index === 2

              return (
                <div
                  key={stat.key}
                  className={
                    isPrimary
                      ? 'relative flex items-end justify-between gap-4 overflow-hidden bg-primary px-5 py-5 text-primary-foreground sm:px-7'
                      : 'flex items-end justify-between gap-4 border-b-2 border-foreground px-5 py-5 sm:border-b-0 sm:border-r-2 sm:px-7'
                  }
                >
                  <div className="min-w-0">
                    <dt className="brutal-eyebrow opacity-70">{stat.label}</dt>
                    <dd className="mt-1.5 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-black leading-none">
                      {stat.value}
                    </dd>
                  </div>

                  <Icon
                    aria-hidden
                    className="h-8 w-8 shrink-0 opacity-80 sm:h-9 sm:w-9"
                    strokeWidth={1.75}
                  />

                  {isPrimary ? (
                    <span
                      aria-hidden
                      className="brutal-dots pointer-events-none absolute -right-2 bottom-0 top-0 w-16 opacity-30"
                    />
                  ) : null}
                </div>
              )
            })}
          </dl>
        </div>

        <span
          aria-hidden
          className="brutal-dots hidden h-10 w-10 shrink-0 self-center opacity-60 lg:block"
        />
      </div>
    </section>
  )
}
