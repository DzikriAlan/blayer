'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SELECT_CLASS } from '@/features/agents/components/agentsConfigFields'
import { useProjectsStates } from '../states/projectsStates'
import { useProjectsControllers } from '../controllers/projectsControllers'
import type { ProjectsEnvironment } from '../types/projectsTypes'

const ENVIRONMENTS: ProjectsEnvironment[] = [
  'DEVELOPMENT',
  'STAGING',
  'PRODUCTION',
]

export default function ProjectsKeys() {
  const { projectsDetail, createdKey } = useProjectsStates()
  const { storeProjectsKey } = useProjectsControllers()

  const [form, setForm] = useState<{
    name: string
    environment: ProjectsEnvironment
  }>({ name: '', environment: 'DEVELOPMENT' })

  const project = projectsDetail.data

  const saveKey = (event: React.FormEvent) => {
    event.preventDefault()
    if (!project) return

    storeProjectsKey.mutate(
      {
        projectId: project.id,
        name: form.name.trim(),
        environment: form.environment,
      },
      { onSuccess: () => setForm({ name: '', environment: 'DEVELOPMENT' }) }
    )
  }

  if (!project) return null

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="text-lg font-medium tracking-tight">API key project</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Kunci inilah yang dipakai aplikasimu memanggil agent. Token penuhnya
          hanya ditampilkan sekali, saat dibuat.
        </p>

        {createdKey ? (
          <div className="mt-5 rounded-lg border border-primary/40 bg-primary/10 p-4">
            <p className="text-xs font-medium text-primary">
              SALIN SEKARANG — TIDAK BISA DILIHAT LAGI
            </p>
            <code className="mt-3 block break-all text-sm text-foreground">
              {createdKey.token}
            </code>
          </div>
        ) : null}

        <ul className="mt-5 flex flex-col gap-3">
          {project.apiKeys.map((apiKey) => (
            <li
              key={apiKey.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <span className="text-sm">
                {apiKey.name}
                <span className="text-muted-foreground"> · {apiKey.prefix}…</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {apiKey.environment}
                {apiKey.isRevoked ? ' · DICABUT' : ''}
              </span>
            </li>
          ))}
          {!project.apiKeys.length ? (
            <li className="text-sm text-muted-foreground">
              Belum ada API key. Project consumer butuh satu kunci untuk
              memanggil agent.
            </li>
          ) : null}
        </ul>
      </div>

      <form
        onSubmit={saveKey}
        className="flex h-fit flex-col gap-4 rounded-xl border border-border bg-card p-6"
      >
        <h3 className="text-lg font-medium tracking-tight">Key baru</h3>

        <div className="flex flex-col gap-2">
          <Label htmlFor="key-name">Nama</Label>
          <Input
            id="key-name"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="server produksi"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="key-environment">Environment</Label>
          <select
            id="key-environment"
            className={SELECT_CLASS}
            value={form.environment}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                environment: event.target.value as ProjectsEnvironment,
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

        {storeProjectsKey.isError ? (
          <p className="text-sm leading-relaxed text-destructive">
            {storeProjectsKey.error.message}
          </p>
        ) : null}

        <Button type="submit" disabled={storeProjectsKey.isPending || !form.name.trim()}>
          {storeProjectsKey.isPending ? 'Menyimpan…' : 'Buat API key'}
        </Button>
      </form>
    </section>
  )
}
