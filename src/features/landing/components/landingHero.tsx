import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]"
      />
      <span aria-hidden className="noise pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-16 sm:px-8 sm:pb-16 sm:pt-24">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-end">
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Build Excellent AI Agent,
            <br />
            <span className="text-primary">Your Way.</span>
          </h1>

          <div className="flex flex-col gap-6 lg:pb-2">
            <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
              Blayer adalah AI Agent Platform yang kamu jalankan sendiri. Ia
              mengatur prompt, model, versi, tool, dan pengetahuan agentmu —
              sementara data bisnisnya tetap tinggal di aplikasimu.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/console">Masuk Console</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/docs">
                  Baca dokumentasi <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
