'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadData } from '@/shared/components/load-data'
import { SELECT_CLASS } from '@/features/agents/components/agentsConfigFields'
import { useProjectsStates } from '../states/projectsStates'
import { useProjectsControllers } from '../controllers/projectsControllers'
import type {
  ProjectsEnvironment,
  ProjectsProvider,
} from '../types/projectsTypes'

const ENVIRONMENTS: ProjectsEnvironment[] = [
  'DEVELOPMENT',
  'STAGING',
  'PRODUCTION',
]

const PROVIDERS: ProjectsProvider[] = ['ANTHROPIC', 'OPENAI']

interface Props {
  children?: React.ReactNode
}

export default function ProjectsDetail({ children }: Props) {
  const { projectsDetail, createdKey } = useProjectsStates()
  const { storeProjectsKey, updateProjectsCredential } = useProjectsControllers()

  const [keyForm, setKeyForm] = useState<{
    name: string
    environment: ProjectsEnvironment
  }>({ name: '', environment: 'DEVELOPMENT' })

  const [credentialForm, setCredentialForm] = useState<{
    provider: ProjectsProvider
    environment: ProjectsEnvironment
    secret: string
  }>({ provider: 'ANTHROPIC', environment: 'DEVELOPMENT', secret: '' })

  const project = projectsDetail.data

  const state = useMemo(
    () => ({
      data: project,
      isLoading: projectsDetail.status === 'loading',
      isError: projectsDetail.status === 'error',
      isEmpty: projectsDetail.status === 'empty',
      emptyTitle: 'Project Tidak Ditemukan',
      emptySubtitle: 'Project ini mungkin sudah dihapus.',
      emptyImage: '/no-data.svg',
      errorTitle: 'Gagal Memuat Project',
      errorSubtitle: projectsDetail.statusSubtitle,
    }),
    [project, projectsDetail.status, projectsDetail.statusSubtitle]
  )

  const saveKey = (event: React.FormEvent) => {
    event.preventDefault()
    if (!project) return

    storeProjectsKey.mutate(
      {
        projectId: project.id,
        name: keyForm.name.trim(),
        environment: keyForm.environment,
      },
      { onSuccess: () => setKeyForm({ name: '', environment: 'DEVELOPMENT' }) }
    )
  }

  const saveCredential = (event: React.FormEvent) => {
    event.preventDefault()
    if (!project) return

    updateProjectsCredential.mutate(
      { projectId: project.id, ...credentialForm, secret: credentialForm.secret.trim() },
      { onSuccess: () => setCredentialForm((prev) => ({ ...prev, secret: '' })) }
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <LoadData response={state} minHeight="40vh">
        {project ? (
          <div className="flex flex-col gap-12">
            <div>
              <span className="brutal-eyebrow text-muted-foreground">
                {project.slug}
              </span>
              <h1 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
                {project.name}
                <span className="text-primary">.</span>
              </h1>
              <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
                {project.description || 'Tanpa deskripsi.'}
              </p>
            </div>

            <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
                  API KEY PROJECT
                </h2>

                {createdKey ? (
                  <div className="mt-5 border-2 border-primary bg-paper p-4">
                    <p className="brutal-eyebrow text-primary">
                      SALIN SEKARANG — TIDAK BISA DILIHAT LAGI
                    </p>
                    <code className="mt-3 block break-all font-mono text-xs">
                      {createdKey.token}
                    </code>
                  </div>
                ) : null}

                <ul className="mt-5 flex flex-col gap-3">
                  {project.apiKeys.map((apiKey) => (
                    <li
                      key={apiKey.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-2 border-foreground bg-paper px-4 py-3"
                    >
                      <span className="font-mono text-xs">
                        {apiKey.name}
                        <span className="text-muted-foreground"> · {apiKey.prefix}…</span>
                      </span>
                      <span className="brutal-eyebrow text-muted-foreground">
                        {apiKey.environment}
                        {apiKey.isRevoked ? ' · DICABUT' : ''}
                      </span>
                    </li>
                  ))}
                  {!project.apiKeys.length ? (
                    <li className="font-mono text-xs text-muted-foreground">
                      Belum ada API key. Project consumer butuh satu kunci untuk
                      memanggil agent.
                    </li>
                  ) : null}
                </ul>
              </div>

              <form
                onSubmit={saveKey}
                className="flex h-fit flex-col gap-4 border-2 border-foreground bg-paper p-5"
              >
                <h3 className="font-display text-lg font-black uppercase leading-none tracking-tight">
                  Key Baru
                </h3>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="key-name">Nama</Label>
                  <Input
                    id="key-name"
                    value={keyForm.name}
                    onChange={(event) =>
                      setKeyForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="server produksi"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="key-environment">Environment</Label>
                  <select
                    id="key-environment"
                    className={SELECT_CLASS}
                    value={keyForm.environment}
                    onChange={(event) =>
                      setKeyForm((prev) => ({
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
                  <p className="font-mono text-xs leading-relaxed text-primary">
                    {storeProjectsKey.error.message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={storeProjectsKey.isPending || !keyForm.name.trim()}
                >
                  {storeProjectsKey.isPending ? 'Menyimpan…' : 'Buat API Key'}
                </Button>
              </form>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
                  KREDENSIAL PROVIDER
                </h2>
                <p className="mt-4 max-w-xl font-mono text-xs leading-relaxed text-muted-foreground">
                  Kunci provider disimpan terenkripsi di instance ini dan
                  dipisahkan per environment. Tidak pernah dikirim ke mana pun
                  selain ke provider yang bersangkutan.
                </p>

                <ul className="mt-5 flex flex-col gap-3">
                  {project.providerKeys.map((credential) => (
                    <li
                      key={credential.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-2 border-foreground bg-paper px-4 py-3"
                    >
                      <span className="font-mono text-xs">
                        {credential.provider}
                        <span className="text-muted-foreground">
                          {' '}
                          · {credential.hint}
                        </span>
                      </span>
                      <span className="brutal-eyebrow text-muted-foreground">
                        {credential.environment}
                      </span>
                    </li>
                  ))}
                  {!project.providerKeys.length ? (
                    <li className="font-mono text-xs text-muted-foreground">
                      Belum ada kredensial. Agent tidak bisa dijalankan sebelum
                      providernya punya kunci di environment yang dipakai.
                    </li>
                  ) : null}
                </ul>
              </div>

              <form
                onSubmit={saveCredential}
                className="flex h-fit flex-col gap-4 border-2 border-foreground bg-paper p-5"
              >
                <h3 className="font-display text-lg font-black uppercase leading-none tracking-tight">
                  Simpan Kunci
                </h3>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="credential-provider">Provider</Label>
                  <select
                    id="credential-provider"
                    className={SELECT_CLASS}
                    value={credentialForm.provider}
                    onChange={(event) =>
                      setCredentialForm((prev) => ({
                        ...prev,
                        provider: event.target.value as ProjectsProvider,
                      }))
                    }
                  >
                    {PROVIDERS.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="credential-environment">Environment</Label>
                  <select
                    id="credential-environment"
                    className={SELECT_CLASS}
                    value={credentialForm.environment}
                    onChange={(event) =>
                      setCredentialForm((prev) => ({
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

                <div className="flex flex-col gap-2">
                  <Label htmlFor="credential-secret">Kunci provider</Label>
                  <Input
                    id="credential-secret"
                    type="password"
                    autoComplete="off"
                    value={credentialForm.secret}
                    onChange={(event) =>
                      setCredentialForm((prev) => ({
                        ...prev,
                        secret: event.target.value,
                      }))
                    }
                    placeholder="sk-…"
                  />
                </div>

                {updateProjectsCredential.isError ? (
                  <p className="font-mono text-xs leading-relaxed text-primary">
                    {updateProjectsCredential.error.message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={
                    updateProjectsCredential.isPending ||
                    credentialForm.secret.trim().length < 8
                  }
                >
                  {updateProjectsCredential.isPending ? 'Menyimpan…' : 'Simpan Kunci'}
                </Button>
              </form>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
                  AGENT
                </h2>

                <ul className="mt-5 flex flex-col gap-3">
                  {project.agents.map((agent) => (
                    <li key={agent.id}>
                      <Link
                        href={`/console/agents/${agent.id}`}
                        className="flex flex-wrap items-center justify-between gap-3 border-2 border-foreground bg-paper px-4 py-3 transition-shadow hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]"
                      >
                        <span className="font-mono text-xs">
                          {agent.name}
                          <span className="text-muted-foreground"> · {agent.slug}</span>
                        </span>
                        <span className="brutal-eyebrow text-muted-foreground">
                          {agent.isPublished ? 'PRODUCTION' : 'DRAF'} ·{' '}
                          {String(agent.totalRuns).padStart(2, '0')} RUN
                        </span>
                      </Link>
                    </li>
                  ))}
                  {!project.agents.length ? (
                    <li className="font-mono text-xs text-muted-foreground">
                      Belum ada agent di project ini.
                    </li>
                  ) : null}
                </ul>
              </div>

              {children}
            </section>
          </div>
        ) : null}
      </LoadData>
    </div>
  )
}
