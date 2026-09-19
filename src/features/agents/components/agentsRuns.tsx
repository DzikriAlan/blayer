'use client'

import { useMemo } from 'react'

import { LoadData } from '@/shared/components/load-data'
import { useAgentsStates } from '../states/agentsStates'

export default function AgentsRuns() {
  const { agentsRuns } = useAgentsStates()

  const history = agentsRuns.data

  const state = useMemo(
    () => ({
      data: history?.runs ?? [],
      isLoading: agentsRuns.status === 'loading',
      isError: agentsRuns.status === 'error',
      isEmpty: agentsRuns.status === 'empty',
      emptyTitle: 'Belum Ada Eksekusi',
      emptySubtitle:
        'Tiap eksekusi tercatat lengkap dengan token, biaya, dan lamanya — termasuk yang gagal.',
      emptyImage: '/no-data.svg',
      errorTitle: 'Gagal Memuat Riwayat',
      errorSubtitle: agentsRuns.statusSubtitle,
    }),
    [history, agentsRuns.status, agentsRuns.statusSubtitle]
  )

  const summary = history?.summary

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-stretch gap-3">
        <span className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
          OBSERVABILITY
        </span>
        <span aria-hidden className="brutal-hatch flex-1 opacity-20" />
      </div>

      {summary ? (
        <dl className="grid gap-4 border-2 border-foreground bg-paper p-5 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: 'EKSEKUSI', value: String(summary.totalRuns) },
            { label: 'SUCCESS RATE', value: `${summary.successRate}%` },
            { label: 'RATA LATENCY', value: `${summary.avgLatencyMs} ms` },
            {
              label: 'TOKEN',
              value: `${summary.totalInputTokens}/${summary.totalOutputTokens}`,
            },
            { label: 'BIAYA', value: `$${summary.totalCostUsd.toFixed(4)}` },
          ].map((item) => (
            <div key={item.label}>
              <dt className="brutal-eyebrow text-muted-foreground">{item.label}</dt>
              <dd className="mt-1.5 font-display text-2xl font-black leading-none">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <LoadData response={state} minHeight="20vh">
        <ul className="flex flex-col gap-3">
          {(history?.runs ?? []).map((run) => (
            <li
              key={run.id}
              className="border-2 border-foreground bg-paper px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="brutal-eyebrow">
                  v{run.version} · {run.environment} ·{' '}
                  <span
                    className={
                      run.status === 'FAILED' ? 'text-primary' : 'text-muted-foreground'
                    }
                  >
                    {run.status}
                  </span>
                </span>
                <span className="brutal-eyebrow text-muted-foreground">
                  {run.latencyMs} MS · {run.inputTokens}/{run.outputTokens} TOKEN
                  {run.costUsd === null ? '' : ` · $${run.costUsd.toFixed(6)}`}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 font-mono text-xs leading-relaxed text-muted-foreground">
                {run.input}
              </p>

              <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                {run.status === 'FAILED'
                  ? `${run.errorCode}: ${run.errorMessage}`
                  : run.output}
              </p>
            </li>
          ))}
        </ul>
      </LoadData>
    </div>
  )
}
