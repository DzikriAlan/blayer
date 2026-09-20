'use client'

import { useState } from 'react'
import { CheckCircle2, CircleDot } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import LandingShowcase from './landingShowcase'

type TabKey = 'playground' | 'versi' | 'riwayat'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'playground', label: 'Playground' },
  { key: 'versi', label: 'Versi' },
  { key: 'riwayat', label: 'Riwayat' },
]

const VERSIONS = [
  { version: 'v4', status: 'draf', model: 'claude-opus-5', note: 'instruksi refund diperketat' },
  { version: 'v3', status: 'production', model: 'claude-opus-5', note: 'melayani API key project' },
  { version: 'v2', status: 'arsip', model: 'claude-sonnet-5', note: 'sebelum tool ditambahkan' },
]

const RUNS = [
  { id: 'run_8f21', status: 'SUCCEEDED', latency: '1.9 s', tokens: '1.2k / 480', cost: '$0,018' },
  { id: 'run_8f20', status: 'SUCCEEDED', latency: '2.4 s', tokens: '1.4k / 610', cost: '$0,024' },
  { id: 'run_8f1f', status: 'FAILED', latency: '0.4 s', tokens: '310 / 0', cost: '$0,001' },
]

export default function LandingConsole() {
  const [active, setActive] = useState<TabKey>('playground')

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1 sm:w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            aria-pressed={active === tab.key}
            className={cn(
              'rounded-md px-4 py-2 text-sm transition-colors',
              active === tab.key
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {active === 'playground' ? <LandingShowcase /> : null}

        {active === 'versi' ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <ul className="divide-y divide-border">
              {VERSIONS.map((item) => (
                <li
                  key={item.version}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <span className="flex items-center gap-2.5 text-sm">
                    <CircleDot
                      className={cn(
                        'h-3.5 w-3.5',
                        item.status === 'production' ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    {item.version}
                    <span className="text-muted-foreground">· {item.note}</span>
                  </span>
                  <span className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono">{item.model}</span>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5',
                        item.status === 'production'
                          ? 'border-primary/40 text-primary'
                          : 'border-border'
                      )}
                    >
                      {item.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {active === 'riwayat' ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-3 gap-2 border-b border-border px-5 py-4 sm:grid-cols-4">
              {[
                { label: 'Eksekusi', value: '1.284' },
                { label: 'Sukses', value: '99,1%' },
                { label: 'Rata-rata', value: '2,1 s' },
                { label: 'Biaya', value: '$18,40' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            <ul className="divide-y divide-border">
              {RUNS.map((run) => (
                <li
                  key={run.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-xs"
                >
                  <span className="flex items-center gap-2 font-mono text-muted-foreground">
                    <CheckCircle2
                      className={cn(
                        'h-3.5 w-3.5',
                        run.status === 'SUCCEEDED' ? 'text-emerald-400' : 'text-destructive'
                      )}
                    />
                    {run.id}
                  </span>
                  <span className="flex items-center gap-4 text-muted-foreground">
                    <span>{run.latency}</span>
                    <span>{run.tokens}</span>
                    <span>{run.cost}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
