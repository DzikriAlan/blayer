import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import LandingHero from './landingHero'
import LandingBento from './landingBento'
import LandingFlow from './landingFlow'
import LandingFeature from './landingFeature'
import { LANDING_MARQUEE } from './landingCatalog'

const PROMISES = [
  'Kunci provider terenkripsi di instance-mu, dipisah per project dan environment.',
  'Tool yang mengubah data tidak pernah jalan tanpa konfirmasi.',
  'Tiap eksekusi tercatat lengkap dengan token, biaya, dan lamanya.',
  'Lisensi MIT, tanpa server pusat yang menyimpan data agentmu.',
]

export default function LandingContent() {
  return (
    <>
      <LandingHero />

      <section className="mx-auto w-full max-w-4xl px-3 py-20 text-center sm:px-5 sm:py-24">
        <p className="text-balance text-xl leading-relaxed text-muted-foreground sm:text-2xl">
          Blayer adalah <span className="text-foreground">AI Agent Platform</span>{' '}
          yang kamu jalankan sendiri. Ia mengatur{' '}
          <span className="text-primary">prompt, model, versi, tool, dan
          pengetahuan</span>{' '}
          agentmu — sementara data bisnisnya tetap tinggal di aplikasimu, tidak
          ikut pindah ke mana-mana.
        </p>
      </section>

      <div
        aria-hidden
        className="overflow-hidden border-y border-border bg-card/40 py-3"
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

      <section className="mx-auto w-full max-w-[1600px] px-3 py-20 sm:px-5 sm:py-24">
        <LandingBento />
      </section>

      <section id="cara-kerja" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-20 sm:px-5 sm:py-24">
          <LandingFlow />
        </div>
      </section>

      <section id="fitur" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-20 sm:px-5 sm:py-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="pixel-label text-primary">Yang sudah jalan</span>
              <h2 className="mt-4 max-w-xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Yang bisa dipakai hari ini.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Yang belum selesai ditandai terang-terangan — halaman ini tidak
              menjanjikan apa yang belum ada di dalam.
            </p>
          </div>

          <div className="mt-12">
            <LandingFeature />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-20 sm:px-5 sm:py-24">
          <div className="flex flex-col items-center text-center">
            <span className="pixel-label text-primary">Open source selamanya</span>
            <h2 className="mt-4 max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Jalankan di infrastrukturmu sendiri.
            </h2>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-xl border border-border p-8">
              <span aria-hidden className="mesh absolute inset-0" />
              <span aria-hidden className="noise absolute inset-0 opacity-50" />

              <div className="relative flex h-full flex-col justify-between gap-10">
                <p className="text-2xl font-semibold leading-tight tracking-tight text-white">
                  Satu perintah, instance-mu sendiri.
                </p>

                <pre className="code border-white/15 bg-black/40 text-white/90">
                  <code>{`docker compose up -d
docker compose exec app npx prisma migrate deploy`}</code>
                </pre>
              </div>
            </div>

            <ul className="flex flex-col gap-3">
              {PROMISES.map((promise) => (
                <li
                  key={promise}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card px-3 py-4"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {promise}
                  </span>
                </li>
              ))}

              <li className="mt-2">
                <Button asChild size="lg">
                  <Link href="/console">
                    Mulai dari Console <ArrowRight />
                  </Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
