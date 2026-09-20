import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import LandingBento from './landingBento'
import LandingBlueprints from './landingBlueprints'
import LandingCommunity from './landingCommunity'
import LandingConsole from './landingConsole'
import LandingCta from './landingCta'
import LandingHero from './landingHero'
import LandingOpen from './landingOpen'
import LandingSdk from './landingSdk'
import LandingStack from './landingStack'
import LandingStatus from './landingStatus'
import { LANDING_STEPS, REPO_URL } from './landingCatalog'

const SECTION = 'mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24'

export default function LandingContent() {
  return (
    <>
      <LandingHero />

      <section id="produk" className={`${SECTION} scroll-mt-20`}>
        <LandingBento />

        <p className="mt-10 text-sm text-muted-foreground">
          Pakai satu atau semuanya. Tiap bagian berdiri sendiri, tapi dipasang
          sebagai satu platform.
        </p>
      </section>

      <section className="border-t border-border">
        <div className={SECTION}>
          <LandingStack />
        </div>
      </section>

      <section id="cara-kerja" className="scroll-mt-20 border-t border-border">
        <div className={SECTION}>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Rancang, coba, dan awasi agent
            <br className="hidden sm:block" /> tanpa keluar dari Console
          </h2>

          <div className="mt-10">
            <LandingConsole />
          </div>

          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LANDING_STEPS.map((step, index) => (
              <li key={step.id} className="rounded-xl border border-border bg-card p-5">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <step.icon className="h-4 w-4 text-primary" />
                  Langkah {String(index + 1).padStart(2, '0')}
                </span>
                <p className="mt-3 text-sm font-medium">{step.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="sdk" className="scroll-mt-20 border-t border-border">
        <div className={SECTION}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div>
              <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Panggil Blayer
                <br className="hidden sm:block" /> dari kodemu
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Aplikasi pemanggil tidak perlu tahu model, prompt, atau versi
                mana yang berjalan. Semua itu diatur di Blayer dan bisa berganti
                tanpa mengubah kode ini.
              </p>
            </div>

            <LandingSdk />
          </div>
        </div>
      </section>

      <section id="pola" className="scroll-mt-20 border-t border-border">
        <div className={SECTION}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Mulai dari pola yang sudah terbukti
            </h2>

            <Link
              href={`${REPO_URL}/blob/main/docs/AGENT_API.md`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Baca dokumentasinya
            </Link>
          </div>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Bukan berkas siap unduh — ini susunan bagian yang tinggal kamu rakit
            sendiri di Console.
          </p>

          <div className="mt-10">
            <LandingBlueprints />
          </div>
        </div>
      </section>

      <section id="status" className="scroll-mt-20 border-t border-border">
        <div className={SECTION}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Apa yang sudah jalan, apa yang belum
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Yang belum selesai ditandai terang-terangan — halaman ini tidak
              menjanjikan apa yang belum ada di dalam.
            </p>
          </div>

          <div className="mt-10">
            <LandingStatus />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className={SECTION}>
          <div className="flex flex-col items-center text-center">
            <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Pertanyaan yang biasanya muncul duluan
            </h2>
            <Button asChild variant="secondary" className="mt-7">
              <Link href={`${REPO_URL}/issues`}>
                Tanya di GitHub <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="mt-12">
            <LandingCommunity />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className={SECTION}>
          <LandingOpen />
        </div>
      </section>

      <section className="border-t border-border">
        <div className={SECTION}>
          <LandingCta />
        </div>
      </section>
    </>
  )
}
