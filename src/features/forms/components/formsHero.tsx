import Link from 'next/link'
import {
  ArrowUpRight,
  Copy,
  FileText,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

import { LoadData } from '@/shared/components/load-data'

const TAGLINES = ['Form Builder', 'Take Your Values', 'Take Your Needs']

// Sudut kanan panel dan bilah statistik dipangkas miring. Sudut yang sama
// dipakai dua lapis — lapisan hitam di luar jadi garis tepinya, lapisan isi
// di dalam menyisakan garis itu tetap terlihat di sepanjang potongannya.
const CHAMFER =
  'polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 26px 100%, 0 calc(100% - 26px))'

export interface FormsHeroEvent {
  id: string
  href: string
  title: string
  categoryName: string
  icon: LucideIcon
  totalResponses: number
}

interface Props {
  events: FormsHeroEvent[]
  totalCategory: number
  totalForm: number
  totalResponses: number
}

export default function FormsHero({
  events,
  totalCategory,
  totalForm,
  totalResponses,
}: Props) {
  const eventState = {
    data: events,
    isEmpty: !events.length,
    emptyTitle: 'Belum Ada Acara Dibuka',
    emptySubtitle:
      'Kategori acaranya tetap bisa dijelajahi di bagian bawah halaman ini.',
    emptyImage: '/no-data.svg',
  }

  const stats = [
    { key: 'kategori', label: 'KATEGORI', value: totalCategory, icon: Copy },
    { key: 'form', label: 'FORM AKTIF', value: totalForm, icon: FileText },
    {
      key: 'response',
      label: 'JAWABAN MASUK',
      value: totalResponses,
      icon: TrendingUp,
    },
  ]

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
            Take exactly
            <br />
            what you need
            <span className="text-primary">.</span>
          </h1>

          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-foreground/80">
            Lebih dari form builder, Blayer membangun ekosistem tempat
            kemampuan, peluang, dan penghasilan saling menyambung satu sama
            lain.
          </p>
        </div>

        <div className="relative">
          <span
            aria-hidden
            className="brutal-hatch absolute -top-8 right-14 hidden h-5 w-28 lg:block"
          />

          <div
            className="bg-foreground p-[3px]"
            style={{ clipPath: CHAMFER }}
          >
            <div className="bg-background" style={{ clipPath: CHAMFER }}>
              <div className="flex items-center justify-between gap-3 border-b-2 border-foreground bg-foreground px-4 py-2.5 text-background sm:px-5 sm:py-3">
                <span className="brutal-eyebrow text-[10px] tracking-[0.14em] sm:text-[11px] sm:tracking-[0.18em]">
                  ACARA PALING POPULER
                </span>
                <span className="brutal-eyebrow whitespace-nowrap text-[10px] tracking-[0.14em] opacity-70 sm:text-[11px] sm:tracking-[0.18em]">
                  {String(events.length).padStart(2, '0')} TERATAS
                </span>
              </div>

              <LoadData response={eventState}>
                <ul>
                  {events.map((event) => {
                    const Icon = event.icon

                    return (
                      <li
                        key={event.id}
                        className="border-b-2 border-foreground last:border-b-0"
                      >
                        <Link
                          href={event.href}
                          className="group flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-primary hover:text-primary-foreground sm:gap-4 sm:px-5 sm:py-3.5"
                        >
                          <span className="brutal-index h-8 w-8 shrink-0 transition-colors group-hover:bg-background group-hover:text-foreground sm:h-10 sm:w-10">
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-3 break-words font-display text-[15px] font-black uppercase leading-tight tracking-tight sm:line-clamp-2 sm:text-lg">
                              {event.title}
                            </span>
                            <span className="brutal-eyebrow mt-1 block truncate text-[10px] tracking-[0.1em] text-muted-foreground transition-colors group-hover:text-primary-foreground/80 sm:text-[11px] sm:tracking-[0.18em]">
                              {String(event.totalResponses).padStart(2, '0')}{' '}
                              TERDAFTAR · {event.categoryName}
                            </span>
                          </span>

                          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary-foreground sm:h-5 sm:w-5" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </LoadData>
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
            {stats.map((stat, index) => {
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
                      {String(stat.value).padStart(2, '0')}
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
