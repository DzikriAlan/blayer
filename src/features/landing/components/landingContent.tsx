import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import LandingHero from './landingHero'
import LandingFeature from './landingFeature'
import { LANDING_MARQUEE } from './landingCatalog'

const FLOW = [
  {
    id: 'call',
    title: 'Aplikasimu memanggil',
    body: 'POST /api/v1/agents/{id}/run dengan API key milik projectnya sendiri.',
  },
  {
    id: 'run',
    title: 'Blayer menjalankan',
    body: 'Versi production dimuat, dikirim ke provider yang kamu pilih, hasilnya dicatat.',
  },
  {
    id: 'data',
    title: 'Datamu tetap milikmu',
    body: 'Kredensial provider terenkripsi di instance-mu. Data bisnis tidak pernah masuk ke sini.',
  },
]

export default function LandingContent() {
  return (
    <>
      <LandingHero />

      <div
        aria-hidden
        className="overflow-hidden border-b border-border bg-card/40 py-3"
      >
        <div className="marquee flex w-max items-center gap-10 pl-10">
          {[...LANDING_MARQUEE, ...LANDING_MARQUEE].map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="flex shrink-0 items-center gap-10 text-xs uppercase tracking-[0.16em] text-muted-foreground"
            >
              {word}
              <span className="text-primary">✳</span>
            </span>
          ))}
        </div>
      </div>

      <section id="cara-kerja" className="scroll-mt-20 border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="flex flex-col items-center text-center">
            <span className="text-sm font-medium text-primary">Cara kerjanya</span>
            <h2 className="mt-4 max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Otaknya di sini, datanya tetap di sana.
            </h2>
            <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              Aplikasimu memanggil satu endpoint. Blayer memuat konfigurasi agent
              dan menjalankannya. Saat agent butuh data, yang dipanggil adalah
              endpoint milik projectmu sendiri — Blayer tidak pernah menyentuh
              basis datamu.
            </p>
          </div>

          <ol className="mt-14 grid gap-4 lg:grid-cols-3">
            {FLOW.map((step, index) => (
              <li
                key={step.id}
                className="flex flex-col rounded-xl border border-border bg-card p-6"
              >
                <span className="text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-lg font-medium tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-20 border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="flex flex-col items-center text-center">
            <span className="text-sm font-medium text-primary">Yang sudah jalan</span>
            <h2 className="mt-4 max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Yang bisa dipakai hari ini.
            </h2>
          </div>

          <div className="mt-14">
            <LandingFeature />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border">
        <span
          aria-hidden
          className="glow pointer-events-none absolute -bottom-40 left-1/2 -z-10 h-[26rem] w-[40rem] -translate-x-1/2 blur-2xl"
        />

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-5 py-20 text-center sm:px-8 sm:py-24">
          <h2 className="max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Jalankan di infrastrukturmu sendiri.
          </h2>

          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Blayer berlisensi MIT dan dirancang untuk di-self-host. Tidak ada
            server pusat yang menyimpan kunci provider atau data agentmu.
          </p>

          <Button asChild size="lg">
            <Link href="/console">
              Mulai dari Console <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
