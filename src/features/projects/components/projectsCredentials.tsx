'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

export default function ProjectsCredentials() {
  const { projectsDetail } = useProjectsStates()
  const { modifyProjectsCredential } = useProjectsControllers()

  const [form, setForm] = useState<{
    provider: ProjectsProvider
    environment: ProjectsEnvironment
    secret: string
  }>({ provider: 'ANTHROPIC', environment: 'DEVELOPMENT', secret: '' })

  const project = projectsDetail.data

  const saveCredential = (event: React.FormEvent) => {
    event.preventDefault()
    if (!project) return

    modifyProjectsCredential.mutate(
      { projectId: project.id, ...form, secret: form.secret.trim() },
      { onSuccess: () => setForm((prev) => ({ ...prev, secret: '' })) }
    )
  }

  if (!project) return null

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="text-lg font-medium tracking-tight">Kredensial provider</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Kunci provider disimpan terenkripsi di instance ini dan dipisahkan per
          environment. Tidak pernah dikirim ke mana pun selain ke provider yang
          bersangkutan.
        </p>

        <Table className="mt-5">
          <TableHead>
            <TableRow>
              <TableHeader>Provider</TableHeader>
              <TableHeader>Environment</TableHeader>
              <TableHeader>Petunjuk</TableHeader>
              <TableHeader>Diperbarui</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {project.providerKeys.map((credential) => (
              <TableRow key={credential.id}>
                <TableCell>{credential.provider}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {credential.environment}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {credential.hint}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(credential.updatedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
              </TableRow>
            ))}

            {!project.providerKeys.length ? (
              <TableEmpty colSpan={4}>
                Belum ada kredensial. Agent tidak bisa dijalankan sebelum
                providernya punya kunci di environment yang dipakai.
              </TableEmpty>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <form
        onSubmit={saveCredential}
        className="flex h-fit flex-col gap-4 rounded-xl border border-border bg-card p-6"
      >
        <h3 className="text-lg font-medium tracking-tight">Simpan kunci</h3>

        <div className="flex flex-col gap-2">
          <Label htmlFor="credential-provider">Provider</Label>
          <select
            id="credential-provider"
            className={SELECT_CLASS}
            value={form.provider}
            onChange={(event) =>
              setForm((prev) => ({
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="credential-secret">Kunci provider</Label>
          <Input
            id="credential-secret"
            type="password"
            autoComplete="off"
            value={form.secret}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, secret: event.target.value }))
            }
            placeholder="sk-…"
          />
        </div>

        {modifyProjectsCredential.isError ? (
          <p className="text-sm leading-relaxed text-destructive">
            {modifyProjectsCredential.error.message}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={
            modifyProjectsCredential.isPending || form.secret.trim().length < 8
          }
        >
          {modifyProjectsCredential.isPending ? 'Menyimpan…' : 'Simpan kunci'}
        </Button>
      </form>
    </section>
  )
}
