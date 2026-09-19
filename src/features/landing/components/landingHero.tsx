import Link from 'next/link'

import { Button } from '@/components/ui/button'
import LandingShowcase from './landingShowcase'

export default function LandingHero() {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-3 pt-8 sm:px-5 sm:pt-12">
      <div className="mesh relative overflow-hidden rounded-2xl border border-border">
        <span aria-hidden className="noise pointer-events-none absolute inset-0 opacity-50" />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/40 blur-3xl"
        />

        <div className="relative px-6 pb-0 pt-10 sm:px-10 sm:pt-14">
          <span className="pixel-label inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3.5 py-2 text-white/80 backdrop-blur">
            AI Agent Platform yang kamu jalankan sendiri
          </span>

          <h1 className="mt-6 max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
            Build Excellent AI Agent,
            <br />
            Your Way.
          </h1>

          <p className="mt-5 max-w-lg text-pretty leading-relaxed text-white/70">
            Blayer mengatur AI, project menguasai data. Rancang agent, uji, beri
            versi, dan panggil lewat satu API — tanpa menyerahkan data bisnismu.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/console">Masuk Console</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="border border-white/20 bg-black/30 text-white backdrop-blur hover:bg-black/50"
            >
              <Link href="#cara-kerja">Lihat Cara Kerjanya</Link>
            </Button>
          </div>

          <div className="mt-10 max-w-3xl translate-y-8 sm:mt-14 sm:translate-y-10">
            <LandingShowcase />
          </div>
        </div>
      </div>
    </section>
  )
}
