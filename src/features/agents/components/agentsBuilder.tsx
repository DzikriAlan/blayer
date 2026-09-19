'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { LoadData } from '@/shared/components/load-data'
import AgentsConfigFields from './agentsConfigFields'
import { useAgentsStates } from '../states/agentsStates'
import { useAgentsControllers } from '../controllers/agentsControllers'
import type { AgentsConfigValue, DataAgentsVersion } from '../types/agentsTypes'

const getConfig = (version: DataAgentsVersion): AgentsConfigValue => ({
  provider: version.provider,
  model: version.model,
  effort: version.effort,
  maxTokens: version.maxTokens,
  temperature: version.temperature,
  instructions: version.instructions,
})

export default function AgentsBuilder() {
  const { agentsDetail } = useAgentsStates()
  const { fetchAgentsModels, storeAgentsVersion, storeAgentsPublish } =
    useAgentsControllers()

  const agent = agentsDetail.data
  const [seedId, setSeedId] = useState('')
  const [config, setConfig] = useState<AgentsConfigValue | null>(null)

  // Builder dibuka pada versi yang sedang production; kalau belum ada, pada draf
  // terbaru. Isian hanya di-seed sekali per versi supaya ketikan tidak tertimpa
  // tiap kali datanya disegarkan.
  const seedVersion = useMemo(() => {
    if (!agent?.versions.length) return null

    return (
      agent.versions.find((version) => version.isProduction) ?? agent.versions[0]
    )
  }, [agent])

  // Penyesuaian saat render, bukan lewat effect: begitu versi seed-nya berganti,
  // isian langsung ikut versi itu tanpa satu render perantara yang menampilkan
  // konfigurasi lama.
  if (seedVersion && seedVersion.id !== seedId) {
    setSeedId(seedVersion.id)
    setConfig(getConfig(seedVersion))
  }

  const state = useMemo(
    () => ({
      data: agent,
      isLoading: agentsDetail.status === 'loading',
      isError: agentsDetail.status === 'error',
      isEmpty: agentsDetail.status === 'empty',
      emptyTitle: 'Agent Tidak Ditemukan',
      emptySubtitle: 'Agent ini mungkin sudah dihapus.',
      emptyImage: '/no-data.svg',
      errorTitle: 'Gagal Memuat Agent',
      errorSubtitle: agentsDetail.statusSubtitle,
    }),
    [agent, agentsDetail.status, agentsDetail.statusSubtitle]
  )

  const saveVersion = (event: React.FormEvent) => {
    event.preventDefault()
    if (!agent || !config) return

    storeAgentsVersion.mutate({
      agentId: agent.id,
      ...config,
      instructions: config.instructions.trim(),
    })
  }

  return (
    <LoadData response={state} minHeight="40vh">
      {agent && config ? (
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <form
            onSubmit={saveVersion}
            className="flex flex-col gap-5 border-2 border-foreground bg-paper p-5"
          >
            <div className="flex items-stretch gap-3">
              <span className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
                KONFIGURASI
              </span>
              <span aria-hidden className="brutal-hatch flex-1 opacity-20" />
            </div>

            <p className="font-mono text-xs leading-relaxed text-muted-foreground">
              Menyimpan perubahan membuat draf versi baru. Versi yang sedang
              melayani production tidak ikut berubah sampai dipublikasikan.
            </p>

            <AgentsConfigFields
              idPrefix="agent-builder"
              value={config}
              models={fetchAgentsModels.data?.models ?? []}
              onChange={(next) =>
                setConfig((prev) => (prev ? { ...prev, ...next } : prev))
              }
            />

            {storeAgentsVersion.isError ? (
              <p className="font-mono text-xs leading-relaxed text-primary">
                {storeAgentsVersion.error.message}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={
                storeAgentsVersion.isPending ||
                config.instructions.trim().length < 10
              }
            >
              {storeAgentsVersion.isPending ? 'Menyimpan…' : 'Simpan Draf Baru'}
            </Button>
          </form>

          <div className="flex h-fit flex-col gap-4 border-2 border-foreground bg-paper p-5">
            <h2 className="font-display text-lg font-black uppercase leading-none tracking-tight">
              Versi
            </h2>

            <ul className="flex flex-col gap-3">
              {agent.versions.map((version) => (
                <li
                  key={version.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-2 border-foreground px-4 py-3"
                >
                  <span className="font-mono text-xs">
                    v{version.version}
                    <span className="text-muted-foreground"> · {version.model}</span>
                  </span>

                  {version.isProduction ? (
                    <span className="brutal-eyebrow bg-primary px-2 py-1 text-primary-foreground">
                      PRODUCTION
                    </span>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={storeAgentsPublish.isPending}
                      onClick={() =>
                        storeAgentsPublish.mutate({
                          agentId: agent.id,
                          versionId: version.id,
                        })
                      }
                    >
                      Publikasikan
                    </Button>
                  )}
                </li>
              ))}
            </ul>

            {storeAgentsPublish.isError ? (
              <p className="font-mono text-xs leading-relaxed text-primary">
                {storeAgentsPublish.error.message}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </LoadData>
  )
}
