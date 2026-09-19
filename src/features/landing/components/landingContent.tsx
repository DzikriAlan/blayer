import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import LandingHero from './landingHero'
import LandingFeature from './landingFeature'
import { LANDING_MARQUEE } from './landingCatalog'

export default function LandingContent() {
  return (
    <>
      <LandingHero />

      <div
        aria-hidden
        className="overflow-hidden border-b-2 border-foreground bg-foreground py-3 text-background"
      >
        <div className="brutal-marquee flex w-max items-center gap-8 pl-8">
          {[...LANDING_MARQUEE, ...LANDING_MARQUEE].map((word, index) => (
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
        id="cara-kerja"
        className="scroll-mt-24 border-b-2 border-foreground bg-background"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex items-stretch gap-3">
            <span className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
              CARA KERJANYA
            </span>
            <span aria-hidden className="brutal-hatch flex-1 opacity-20" />
          </div>

          <h2 className="mt-7 max-w-2xl break-words font-display text-[clamp(1.9rem,4.5vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
            Otaknya di sini,
            <br />
            datanya tetap di sana
            <span className="text-primary">.</span>
          </h2>

          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
            Aplikasimu memanggil satu endpoint. Blayer memuat konfigurasi agent
            dan menjalankannya. Saat agent butuh data, yang dipanggil adalah
            endpoint milik projectmu sendiri — Blayer tidak pernah menyentuh
            basis datamu.
          </p>

          <ol className="mt-12 grid gap-4 sm:gap-6 lg:grid-cols-3">
            {[
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
            ].map((step, index) => (
              <li
                key={step.id}
                className="flex flex-col border-2 border-foreground bg-paper p-5"
              >
                <span className="brutal-eyebrow text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 break-words font-display text-lg font-black uppercase leading-tight tracking-tight sm:text-xl">
                  {step.title}
                </h3>
                <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="fitur"
        className="scroll-mt-24 border-b-2 border-foreground bg-background"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex items-stretch gap-3">
            <span className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
              YANG SUDAH JALAN
            </span>
            <span aria-hidden className="brutal-hatch flex-1 opacity-20" />
          </div>

          <h2 className="mt-7 max-w-2xl break-words font-display text-[clamp(1.9rem,4.5vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
            Yang bisa dipakai
            <br />
            hari ini
            <span className="text-primary">.</span>
          </h2>

          <div className="mt-12">
            <LandingFeature />
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground bg-paper">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="max-w-2xl break-words font-display text-[clamp(1.9rem,4.5vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
            Jalankan di infrastrukturmu sendiri
            <span className="text-primary">.</span>
          </h2>

          <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
            Blayer berlisensi MIT dan dirancang untuk di-self-host. Tidak ada
            server pusat yang menyimpan kunci provider atau data agentmu.
          </p>

          <Button asChild size="lg">
            <Link href="/console">
              Mulai dari Console <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
