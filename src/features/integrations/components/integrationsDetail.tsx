'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadData } from '@/shared/components/load-data'
import { SELECT_CLASS } from '@/features/agents/components/agentsConfigFields'
import { useIntegrationsStates } from '../states/integrationsStates'
import { useIntegrationsControllers } from '../controllers/integrationsControllers'
import type {
  IntegrationsMethod,
  IntegrationsPermission,
} from '../types/integrationsTypes'

const METHODS: IntegrationsMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const DEFAULT_SCHEMA = `{
  "type": "object",
  "properties": {
    "month": { "type": "string", "description": "Periode YYYY-MM" }
  },
  "required": ["month"]
}`

export default function IntegrationsDetail() {
  const { integrationsDetail } = useIntegrationsStates()
  const { storeIntegrationsTool, removeIntegrationsTool } =
    useIntegrationsControllers()

  const integration = integrationsDetail.data

  const [form, setForm] = useState<{
    name: string
    description: string
    method: IntegrationsMethod
    path: string
    permission: IntegrationsPermission
    inputSchema: string
  }>({
    name: '',
    description: '',
    method: 'GET',
    path: '',
    permission: 'READ',
    inputSchema: DEFAULT_SCHEMA,
  })

  const [schemaError, setSchemaError] = useState('')

  const state = useMemo(
    () => ({
      data: integration,
      isLoading: integrationsDetail.status === 'loading',
      isError: integrationsDetail.status === 'error',
      isEmpty: integrationsDetail.status === 'empty',
      emptyTitle: 'Integration tidak ditemukan',
      emptySubtitle: 'Integration ini mungkin sudah dihapus.',
      errorTitle: 'Gagal memuat integration',
      errorSubtitle: integrationsDetail.statusSubtitle,
    }),
    [integration, integrationsDetail.status, integrationsDetail.statusSubtitle]
  )

  const editForm = (next: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...next }))

  const saveTool = (event: React.FormEvent) => {
    event.preventDefault()
    if (!integration) return

    let inputSchema: Record<string, unknown>

    // Skema ditulis tangan sebagai JSON. Kesalahan ketiknya ditangkap di sini
    // supaya tidak baru ketahuan saat agent memanggil toolnya.
    try {
      inputSchema = JSON.parse(form.inputSchema) as Record<string, unknown>
    } catch {
      setSchemaError('Skema masukan bukan JSON yang sah.')
      return
    }

    setSchemaError('')

    storeIntegrationsTool.mutate(
      {
        integrationId: integration.id,
        name: form.name.trim(),
        description: form.description.trim(),
        method: form.method,
        path: form.path.trim(),
        permission: form.permission,
        inputSchema,
      },
      {
        onSuccess: () =>
          setForm({
            name: '',
            description: '',
            method: 'GET',
            path: '',
            permission: 'READ',
            inputSchema: DEFAULT_SCHEMA,
          }),
      }
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <LoadData response={state} minHeight="40vh">
        {integration ? (
          <div className="flex flex-col gap-10">
            <div className="mesh-soft relative overflow-hidden rounded-2xl border border-border px-6 py-10 sm:px-10">
              <span aria-hidden className="noise pointer-events-none absolute inset-0 opacity-40" />
              <div className="relative">
                <span className="pixel-label text-primary">Integration</span>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                  {integration.name}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {integration.slug} · {integration.auth}
                </p>
                <p className="mt-3 font-mono text-sm text-muted-foreground">
                  {integration.baseUrl}
                  {integration.hint ? ` · kredensial ${integration.hint}` : ''}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="text-lg font-medium tracking-tight">
                  Tool terdaftar
                </h2>

                <ul className="mt-5 flex flex-col gap-3">
                  {integration.tools.map((tool) => (
                    <li
                      key={tool.id}
                      className="rounded-lg border border-border bg-card px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-mono text-sm">{tool.name}</span>
                        <span className="flex items-center gap-2">
                          <span
                            className={
                              tool.permission === 'WRITE'
                                ? 'rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/30'
                                : 'rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground'
                            }
                          >
                            {tool.permission}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={removeIntegrationsTool.isPending}
                            onClick={() =>
                              removeIntegrationsTool.mutate({ id: tool.id })
                            }
                          >
                            Hapus
                          </Button>
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {tool.description}
                      </p>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">
                        {tool.method} {tool.path}
                      </p>
                    </li>
                  ))}

                  {!integration.tools.length ? (
                    <li className="text-sm text-muted-foreground">
                      Belum ada tool. Agent hanya bisa memanggil tool yang
                      kontraknya terdaftar di sini.
                    </li>
                  ) : null}
                </ul>
              </div>

              <form
                onSubmit={saveTool}
                className="flex h-fit flex-col gap-4 rounded-xl border border-border bg-card p-6"
              >
                <h3 className="text-lg font-medium tracking-tight">Tool baru</h3>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="tool-name">Nama</Label>
                  <Input
                    id="tool-name"
                    value={form.name}
                    onChange={(event) => editForm({ name: event.target.value })}
                    placeholder="get_profit_loss"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="tool-description">Deskripsi</Label>
                  <Textarea
                    id="tool-description"
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      editForm({ description: event.target.value })
                    }
                    placeholder="Jelaskan kapan tool ini dipakai — model membaca ini."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="tool-method">Method</Label>
                    <select
                      id="tool-method"
                      className={SELECT_CLASS}
                      value={form.method}
                      onChange={(event) =>
                        editForm({
                          method: event.target.value as IntegrationsMethod,
                        })
                      }
                    >
                      {METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="tool-permission">Izin</Label>
                    <select
                      id="tool-permission"
                      className={SELECT_CLASS}
                      value={form.permission}
                      onChange={(event) =>
                        editForm({
                          permission: event.target.value as IntegrationsPermission,
                        })
                      }
                    >
                      <option value="READ">READ — baca data</option>
                      <option value="WRITE">WRITE — mengubah data</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="tool-path">Path</Label>
                  <Input
                    id="tool-path"
                    value={form.path}
                    onChange={(event) => editForm({ path: event.target.value })}
                    placeholder="/ai/tools/profit-loss"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="tool-schema">Skema masukan</Label>
                  <Textarea
                    id="tool-schema"
                    rows={8}
                    className="font-mono text-xs"
                    value={form.inputSchema}
                    onChange={(event) =>
                      editForm({ inputSchema: event.target.value })
                    }
                  />
                </div>

                {form.permission === 'WRITE' ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Tool WRITE tidak pernah dijalankan langsung: eksekusi berhenti
                    dan menunggu konfirmasi dari pemanggil.
                  </p>
                ) : null}

                {schemaError || storeIntegrationsTool.isError ? (
                  <p className="text-sm leading-relaxed text-destructive">
                    {schemaError || storeIntegrationsTool.error?.message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={
                    storeIntegrationsTool.isPending ||
                    !form.name.trim() ||
                    !form.path.trim() ||
                    form.description.trim().length < 10
                  }
                >
                  {storeIntegrationsTool.isPending ? 'Menyimpan…' : 'Daftarkan tool'}
                </Button>
              </form>
            </div>
          </div>
        ) : null}
      </LoadData>
    </div>
  )
}
