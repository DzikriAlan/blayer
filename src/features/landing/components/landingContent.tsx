'use client'

import { useMemo } from 'react'

import LandingHero from './landingHero'
import LandingCategory from './landingCategory'
import { LANDING_CATEGORIES } from './landingCatalog'

const HERO_EVENT_LIMIT = 4

const MARQUEE_WORDS = [
  'TEKNOLOGI',
  'OLAHRAGA',
  'MUSIK & SENI',
  'BISNIS & KARIER',
  'TIKET TERBIT SENDIRI',
]

export default function LandingContent() {
  const data = useMemo(() => {
    const events = LANDING_CATEGORIES.flatMap((category) =>
      category.events.map((event) => ({ event, category }))
    )

    return {
      categories: LANDING_CATEGORIES,
      totalCategory: LANDING_CATEGORIES.length,
      totalEvent: events.length,
      totalResponses: events.reduce(
        (total, item) => total + item.event.totalResponses,
        0
      ),
      heroEvents: events
        .map(({ event, category }) => ({
          id: event.id,
          title: event.title,
          categoryName: category.name,
          icon: category.icon,
          totalResponses: event.totalResponses,
        }))
        .sort((left, right) => right.totalResponses - left.totalResponses)
        .slice(0, HERO_EVENT_LIMIT),
      marqueeWords: [...MARQUEE_WORDS, ...MARQUEE_WORDS],
    }
  }, [])

  return (
    <>
      <LandingHero
        events={data.heroEvents}
        totalCategory={data.totalCategory}
        totalEvent={data.totalEvent}
        totalResponses={data.totalResponses}
      />

      <div
        aria-hidden
        className="overflow-hidden border-b-2 border-foreground bg-foreground py-3 text-background"
      >
        <div className="brutal-marquee flex w-max items-center gap-8 pl-8">
          {data.marqueeWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="brutal-eyebrow flex shrink-0 items-center gap-8"
            >
              {word}
              <span className="text-primary">✳</span>
            </span>
          ))}
        </div>
      </div>

      <section
        id="kategori"
        className="scroll-mt-24 border-b-2 border-foreground bg-background"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex items-stretch gap-3">
            <span className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
              YANG SEDANG TERBUKA
            </span>
            <span aria-hidden className="brutal-hatch flex-1 opacity-20" />
          </div>

          <h2 className="mt-7 max-w-2xl break-words font-display text-[clamp(1.9rem,4.5vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
            Pilih acaranya,
            <br />
            langsung ikut
            <span className="text-primary">.</span>
          </h2>

          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
            Semua pendaftarannya sedang dibuka sekarang. Pilih kategori yang
            kamu minati dan daftar langsung — tanpa perlu membuat apa pun
            lebih dulu.
          </p>

          <div className="mt-12">
            <LandingCategory data={data.categories} />
          </div>
        </div>
      </section>
    </>
  )
}
