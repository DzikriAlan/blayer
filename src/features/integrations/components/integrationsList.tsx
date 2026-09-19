'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadData } from '@/shared/components/load-data'
import { SELECT_CLASS } from '@/features/agents/components/agentsConfigFields'
import { useIntegrationsStates } from '../states/integrationsStates'
import { useIntegrationsControllers } from '../controllers/integrationsControllers'
import type { IntegrationsAuth } from '../types/integrationsTypes'

const AUTHS: { value: IntegrationsAuth; label: string }[] = [
  { value: 'NONE', label: 'Tanpa autentikasi' },
  { value: 'BEARER', label: 'Bearer token' },
  { value: 'HEADER', label: 'Header khusus' },
]

const getSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)

interface Props {
  projectId: string
}

export default function IntegrationsList({ projectId }: Props) {
  const { integrations } = useIntegrationsStates()
  const { storeIntegrations } = useIntegrationsControllers()

  const [form, setForm] = useState<{
    name: string
    slug: string
    baseUrl: string
    auth: IntegrationsAuth
    authHeader: string
    secret: string
  }>({
    name: '',
    slug: '',
    baseUrl: '',
    auth: 'NONE',
    authHeader: '',
    secret: '',
  })

  const state = useMemo(
    () => ({
      data: integrations.data,
      isLoading: integrations.status === 'loading',
      isError: integrations.status === 'error',
      isEmpty: integrations.status === 'empty',
      emptyTitle: 'Belum ada integration',
      emptySubtitle:
        'Integration menyimpan alamat dan kredensial API projectmu. Toolnya menempel di situ.',
      errorTitle: 'Gagal memuat integration',
      errorSubtitle: integrations.statusSubtitle,
    }),
    [integrations]
  )

  const editForm = (next: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...next }))

  const saveIntegrations = (event: React.FormEvent) => {
    event.preventDefault()

    storeIntegrations.mutate(
      {
        projectId,
        name: form.name.trim(),
        slug: (form.slug || getSlug(form.name)).trim(),
        description: '',
        baseUrl: form.baseUrl.trim(),
        auth: form.auth,
        authHeader: form.authHeader.trim(),
        secret: form.secret.trim(),
      },
      {
        onSuccess: () =>
          setForm({
            name: '',
            slug: '',
            baseUrl: '',
            auth: 'NONE',
            authHeader: '',
            secret: '',
          }),
      }
    )
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="text-lg font-medium tracking-tight">Integration</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Blayer hanya menyimpan alamat dan kredensialnya. Yang menjalankan tool
          tetap endpoint milik projectmu sendiri.
        </p>

        <div className="mt-5">
          <LoadData response={state} minHeight="12vh">
            <ul className="flex flex-col gap-3">
              {integrations.data.map((integration) => (
                <li key={integration.id}>
                  <Link
                    href={`/console/integrations/${integration.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <span className="text-sm">
                      {integration.name}
                      <span className="text-muted-foreground">
                        {' '}
                        · {integration.baseUrl}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {integration.totalTools} tool · {integration.auth}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </LoadData>
        </div>
      </div>

      <form
        onSubmit={saveIntegrations}
        className="flex h-fit flex-col gap-4 rounded-xl border border-border bg-card p-6"
      >
        <h3 className="text-lg font-medium tracking-tight">Integration baru</h3>

        <div className="flex flex-col gap-2">
          <Label htmlFor="integration-name">Nama</Label>
          <Input
            id="integration-name"
            value={form.name}
            onChange={(event) =>
              editForm({
                name: event.target.value,
                slug: getSlug(event.target.value),
              })
            }
            placeholder="EasyAccounting"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="integration-base-url">Base URL</Label>
          <Input
            id="integration-base-url"
            value={form.baseUrl}
            onChange={(event) => editForm({ baseUrl: event.target.value })}
            placeholder="https://app.easyaccounting.id/api"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="integration-auth">Autentikasi</Label>
          <select
            id="integration-auth"
            className={SELECT_CLASS}
            value={form.auth}
            onChange={(event) =>
              editForm({ auth: event.target.value as IntegrationsAuth })
            }
          >
            {AUTHS.map((auth) => (
              <option key={auth.value} value={auth.value}>
                {auth.label}
              </option>
            ))}
          </select>
        </div>

        {form.auth === 'HEADER' ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="integration-auth-header">Nama header</Label>
            <Input
              id="integration-auth-header"
              value={form.authHeader}
              onChange={(event) => editForm({ authHeader: event.target.value })}
              placeholder="X-Internal-Key"
            />
          </div>
        ) : null}

        {form.auth !== 'NONE' ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="integration-secret">Kredensial</Label>
            <Input
              id="integration-secret"
              type="password"
              autoComplete="off"
              value={form.secret}
              onChange={(event) => editForm({ secret: event.target.value })}
              placeholder="token ke API projectmu"
            />
          </div>
        ) : null}

        {storeIntegrations.isError ? (
          <p className="text-sm leading-relaxed text-destructive">
            {storeIntegrations.error.message}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={
            storeIntegrations.isPending ||
            !form.name.trim() ||
            !form.baseUrl.trim()
          }
        >
          {storeIntegrations.isPending ? 'Menyimpan…' : 'Buat integration'}
        </Button>
      </form>
    </section>
  )
}
