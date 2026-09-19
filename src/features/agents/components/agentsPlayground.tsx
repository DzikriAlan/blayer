'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SELECT_CLASS } from './agentsConfigFields'
import { useAgentsStates } from '../states/agentsStates'
import { useAgentsControllers } from '../controllers/agentsControllers'
import type { AgentsEnvironment } from '../types/agentsTypes'

const ENVIRONMENTS: AgentsEnvironment[] = [
  'DEVELOPMENT',
  'STAGING',
  'PRODUCTION',
]

export default function AgentsPlayground() {
  const { agentsDetail, playgroundResult } = useAgentsStates()
  const { storeAgentsRun } = useAgentsControllers()

  const agent = agentsDetail.data
  const [form, setForm] = useState<{
    input: string
    versionId: string
    environment: AgentsEnvironment
  }>({ input: '', versionId: '', environment: 'DEVELOPMENT' })

  const versions = useMemo(() => agent?.versions ?? [], [agent])

  const activeVersionId =
    form.versionId || agent?.productionVersionId || versions[0]?.id || ''

  const runAgent = (event: React.FormEvent) => {
    event.preventDefault()
    if (!agent || !activeVersionId) return

    storeAgentsRun.mutate({
      agentId: agent.id,
      input: form.input.trim(),
      versionId: activeVersionId,
      environment: form.environment,
    })
  }

  if (!agent) return null

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <form
        onSubmit={runAgent}
        className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-stretch gap-3">
          <span className="text-sm font-medium text-primary">
            PLAYGROUND
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="playground-version">Versi</Label>
            <select
              id="playground-version"
              className={SELECT_CLASS}
              value={activeVersionId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, versionId: event.target.value }))
              }
            >
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  v{version.version}
                  {version.isProduction ? ' · production' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="playground-environment">Environment</Label>
            <select
              id="playground-environment"
              className={SELECT_CLASS}
              value={form.environment}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  environment: event.target.value as AgentsEnvironment,
                }))
              }
            >
              {ENVIRONMENTS.map((environment) => (
                <option key={environment} value={environment}>
                  {environment}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="playground-input">Masukan</Label>
          <Textarea
            id="playground-input"
            rows={8}
            value={form.input}
            placeholder="Tulis permintaan yang akan diterima agent."
            onChange={(event) =>
              setForm((prev) => ({ ...prev, input: event.target.value }))
            }
          />
        </div>

        {storeAgentsRun.isError ? (
          <p className="text-sm leading-relaxed text-destructive">
            {storeAgentsRun.error.message}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={storeAgentsRun.isPending || !form.input.trim()}
        >
          {storeAgentsRun.isPending ? 'Menjalankan…' : 'Jalankan Agent'}
        </Button>
      </form>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-medium tracking-tight">
          Jawaban
        </h2>

        {playgroundResult ? (
          <>
            <dl className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 sm:grid-cols-4">
              {[
                { label: 'VERSI', value: `v${playgroundResult.version}` },
                { label: 'LATENCY', value: `${playgroundResult.latencyMs} ms` },
                {
                  label: 'TOKEN',
                  value: `${playgroundResult.inputTokens}/${playgroundResult.outputTokens}`,
                },
                {
                  label: 'BIAYA',
                  value:
                    playgroundResult.costUsd === null
                      ? '—'
                      : `$${playgroundResult.costUsd.toFixed(6)}`,
                },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm">{item.value}</dd>
                </div>
              ))}
            </dl>

            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {playgroundResult.output}
            </p>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Belum ada jawaban di sesi ini. Jalankan agent untuk melihat keluaran,
            token, dan biayanya.
          </p>
        )}
      </div>
    </div>
  )
}
