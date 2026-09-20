'use client'

import { useState } from 'react'

import { cn } from '@/shared/lib/utils'
import LandingCode, { type CodeToken } from './landingCode'

type TabKey = 'typescript' | 'curl'

const TABS: { key: TabKey; label: string; file: string }[] = [
  { key: 'typescript', label: 'TypeScript', file: 'app/laporan.ts' },
  { key: 'curl', label: 'cURL', file: 'terminal' },
]

const TYPESCRIPT: CodeToken[][] = [
  [
    ['key', 'import '],
    ['txt', '{ BlayerClient } '],
    ['key', 'from '],
    ['str', "'@blayer/sdk'"],
  ],
  [],
  [
    ['key', 'const '],
    ['txt', 'blayer = '],
    ['key', 'new '],
    ['fn', 'BlayerClient'],
    ['txt', '({ apiKey: process.env.BLAYER_API_KEY })'],
  ],
  [],
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

const CURL: CodeToken[][] = [
  [
    ['fn', 'curl '],
    ['txt', '-X POST '],
    ['str', 'https://blayer.id/api/v1/agents/$AGENT_ID/run'],
    ['txt', ' \\'],
  ],
  [
    ['txt', '  -H '],
    ['str', '"Authorization: Bearer $BLAYER_API_KEY"'],
    ['txt', ' \\'],
  ],
  [
    ['txt', '  -H '],
    ['str', "'Content-Type: application/json'"],
    ['txt', ' \\'],
  ],
  [
    ['txt', '  -d '],
    ['str', '\'{ "input": "Berapa laba bulan lalu?" }\''],
  ],
  [],
  [['com', '# { "success": true, "data": { "output": "…", "costUsd": 0.0182 } }']],
]

export default function LandingSdk() {
  const [active, setActive] = useState<TabKey>('typescript')

  const tab = TABS.find((item) => item.key === active) ?? TABS[0]

  return (
    <div>
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 sm:w-fit">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActive(item.key)}
            aria-pressed={active === item.key}
            className={cn(
              'rounded-md px-4 py-2 text-sm transition-colors',
              active === item.key
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <LandingCode
        className="mt-5"
        title={tab.file}
        lines={active === 'typescript' ? TYPESCRIPT : CURL}
      />
    </div>
  )
}
