import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LoadData } from '@/shared/components/load-data'

const TAGLINES = ['Form Builder', 'Take Your Values', 'Take Your Needs']

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
  onLoadFormsCategory: () => void
}

export default function FormsHero({
  events,
  totalCategory,
  totalForm,
  totalResponses,
  onLoadFormsCategory,
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
    { key: 'kategori', label: 'KATEGORI', value: totalCategory },
    { key: 'form', label: 'FORM AKTIF', value: totalForm },
    { key: 'response', label: 'JAWABAN MASUK', value: totalResponses },
  ]

  return (
    <section className="flex flex-col border-b-2 border-foreground bg-paper lg:min-h-[calc(100svh-4.4rem)]">
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div>
          <span className="brutal-eyebrow inline-block bg-primary px-3 py-2 text-primary-foreground">
            <span className="brutal-rotator">
              <span aria-hidden className="brutal-rotator-track">
                {[...TAGLINES, TAGLINES[0]].map((tagline, index) => (
                  <span key={`${tagline}-${index}`}>{tagline}</span>
                ))}
              </span>
            </span>
            <span className="sr-only">{TAGLINES.join(' — ')}</span>
          </span>

          <h1 className="mt-5 hyphens-auto break-words font-display text-[clamp(2.25rem,5.6vw,4rem)] font-black uppercase leading-[0.86] tracking-[-0.03em]">
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

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/forms/create">
                Buat Form <ArrowRight />
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onLoadFormsCategory}
            >
              Jelajahi Kategori <ArrowDown />
            </Button>
          </div>

          <p className="brutal-eyebrow mt-5 text-muted-foreground">
            PILIH TEMPLATE · SESUAIKAN PERTANYAAN · BAGIKAN TAUTANNYA
          </p>
        </div>

        <div className="border-2 border-foreground bg-background">
          <div className="flex items-center justify-between gap-3 border-b-2 border-foreground bg-foreground px-5 py-3 text-background">
            <span className="brutal-eyebrow">ACARA PALING POPULER</span>
            <span className="brutal-eyebrow opacity-70">
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
                      className="group flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <span className="brutal-index h-10 w-10 shrink-0 transition-colors group-hover:bg-background group-hover:text-foreground">
                        <Icon className="h-5 w-5" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 block break-words font-display text-lg font-black uppercase leading-tight tracking-tight">
                          {event.title}
                        </span>
                        <span className="brutal-eyebrow text-muted-foreground transition-colors group-hover:text-primary-foreground/80">
                          {String(event.totalResponses).padStart(2, '0')}{' '}
                          TERDAFTAR · {event.categoryName}
                        </span>
                      </span>

                      <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary-foreground" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </LoadData>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 pb-8 sm:px-8 sm:pb-10">
        <dl className="grid border-2 border-foreground sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.key}
              className={
                index === 2
                  ? 'bg-primary px-5 py-5 text-primary-foreground sm:px-7'
                  : 'border-b-2 border-foreground px-5 py-5 sm:border-b-0 sm:border-r-2 sm:px-7'
              }
            >
              <dt className="brutal-eyebrow opacity-70">{stat.label}</dt>
              <dd className="mt-1.5 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-black leading-none">
                {String(stat.value).padStart(2, '0')}
              </dd>
            </div>
          ))}
        </dl>
      </div>

    </section>
  )
}
