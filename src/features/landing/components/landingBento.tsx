import Link from 'next/link'
import { ArrowRight, GitBranch, LineChart, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import LandingCode, { type CodeToken } from './landingCode'

const RUN_SNIPPET: CodeToken[][] = [
  [['com', '// panggil agent dari aplikasimu']],
  [
    ['key', 'const '],
    ['txt', 'run = '],
    ['key', 'await '],
    ['txt', 'blayer.agents.'],
    ['fn', 'run'],
    ['txt', '({'],
  ],
  [
    ['txt', '  agentId: '],
    ['str', "'accounting-assistant'"],
    ['txt', ','],
  ],
  [
    ['txt', '  input: '],
    ['str', "'Berapa laba bulan lalu?'"],
    ['txt', ','],
  ],
  [['txt', '})']],
  [],
  [
    ['txt', 'run.output      '],
    ['com', '// "Laba bulan lalu Rp12.480.000."'],
  ],
  [
    ['txt', 'run.costUsd     '],
    ['com', '// 0.0182'],
  ],
]

const TOOL_SNIPPET: CodeToken[][] = [
  [['com', '// yang tersimpan hanya kontraknya']],
  [
    ['key', 'await '],
    ['txt', 'blayer.tools.'],
    ['fn', 'register'],
    ['txt', '({'],
  ],
  [
    ['txt', '  name: '],
    ['str', "'get_profit_loss'"],
    ['txt', ','],
  ],
  [
    ['txt', '  method: '],
    ['str', "'GET'"],
    ['txt', ', path: '],
    ['str', "'/ai/tools/profit-loss'"],
    ['txt', ','],
  ],
  [
    ['txt', '  permission: '],
    ['str', "'READ'"],
    ['txt', ','],
  ],
  [['txt', '})']],
]

export default function LandingBento() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 lg:col-span-2">
        <span
          aria-hidden
          className="mesh-soft pointer-events-none absolute inset-0 opacity-70"
        />
        <div className="relative">
          <h3 className="text-xl font-medium tracking-tight">
            Satu panggilan, bukan satu proyek sendiri.
          </h3>
          <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Aplikasi consumer tidak perlu tahu model, prompt, atau versi mana yang
            berjalan. Semua itu diatur di Blayer dan bisa berganti tanpa mengubah
            kodenya.
          </p>

          <LandingCode className="mt-6" title="app/laporan.ts" lines={RUN_SNIPPET} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-6">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="mt-4 text-lg font-medium tracking-tight">
            Tool tulis berhenti dulu.
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Agent boleh meminta, tapi tidak boleh memutuskan. Eksekusi berhenti dan
            menunggu konfirmasi sebelum data apa pun berubah.
          </p>
        </div>

        <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-6">
          <LineChart className="h-5 w-5 text-primary" />
          <h3 className="mt-4 text-lg font-medium tracking-tight">
            Semua eksekusi tercatat.
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Termasuk yang gagal — jadi success rate, latency, token, dan biayanya
            memang angka sebenarnya.
          </p>

          <dl className="mt-5 grid grid-cols-3 gap-2">
            {[
              { label: 'Runs', value: '1.284' },
              { label: 'Sukses', value: '99,1%' },
              { label: 'Biaya', value: '$18,40' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-background/60 px-2.5 py-2"
              >
                <dt className="text-[11px] text-muted-foreground">{item.label}</dt>
                <dd className="mt-0.5 text-sm font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <GitBranch className="h-5 w-5 text-primary" />
        <h3 className="mt-4 text-lg font-medium tracking-tight">
          Versi, bukan tambal prompt.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Tiap perubahan lahir sebagai draf. Yang melayani production tidak ikut
          berubah sampai kamu menaikkannya — dan rollback cukup satu langkah.
        </p>

        <ul className="mt-5 flex flex-col gap-2">
          {[
            { label: 'v4 · draf', isProduction: false },
            { label: 'v3 · production', isProduction: true },
            { label: 'v2 · arsip', isProduction: false },
          ].map((item) => (
            <li
              key={item.label}
              className={
                item.isProduction
                  ? 'rounded-lg bg-primary/15 px-3 py-2 text-sm text-primary ring-1 ring-inset ring-primary/30'
                  : 'rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground'
              }
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
        <h3 className="text-lg font-medium tracking-tight">
          Kontraknya di Blayer, datanya tetap di kamu.
        </h3>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Blayer menyimpan nama, deskripsi, method, path, dan skema masukan tool.
          Yang menjalankan tetap endpoint milik projectmu, di infrastrukturmu.
        </p>

        <LandingCode className="mt-6" title="scripts/register-tools.ts" lines={TOOL_SNIPPET} />

        <Button asChild variant="secondary" size="sm" className="mt-6">
          <Link href="#fitur">
            Lihat semua kemampuannya <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  )
}
