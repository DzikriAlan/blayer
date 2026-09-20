import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import LandingCode, { type CodeToken } from './landingCode'
import { REPO_URL } from './landingCatalog'

const COMPOSE: CodeToken[][] = [
  [['com', '# instance-mu sendiri, dua perintah']],
  [
    ['fn', 'docker '],
    ['txt', 'compose up -d'],
  ],
  [
    ['fn', 'docker '],
    ['txt', 'compose exec app npx prisma migrate deploy'],
  ],
]

export default function LandingOpen() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div>
        <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Terbuka sejak hari pertama
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Seluruh kodenya bisa dibaca, diubah, dan dijalankan di infrastruktur
          siapa pun. Tidak ada bagian berbayar yang disembunyikan, dan tidak ada
          server pusat yang menerima kunci provider atau data agentmu.
        </p>

        <Button asChild variant="secondary" className="mt-7">
          <Link href={REPO_URL}>
            Lihat di GitHub <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border p-8">
        <span aria-hidden className="mesh pointer-events-none absolute inset-0" />
        <span aria-hidden className="noise pointer-events-none absolute inset-0 opacity-50" />

        <div className="relative">
          <p className="font-mono text-6xl font-semibold tracking-tight text-white sm:text-7xl">
            100<span className="text-white/60">%</span>
          </p>
          <p className="mt-2 text-sm text-white/70">
            berlisensi MIT — termasuk Console, API, dan SDK-nya
          </p>

          <LandingCode
            className="mt-8 [&_pre]:border-white/15 [&_pre]:bg-black/40 [&_pre]:text-white/90"
            lines={COMPOSE}
          />
        </div>
      </div>
    </div>
  )
}
