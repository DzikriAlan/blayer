'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AgentsConfigFields from './agentsConfigFields'
import { useAgentsControllers } from '../controllers/agentsControllers'
import type { AgentsConfigValue } from '../types/agentsTypes'

const getSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)

const DEFAULT_CONFIG: AgentsConfigValue = {
  provider: 'ANTHROPIC',
  model: 'claude-opus-5',
  effort: 'HIGH',
  maxTokens: 16000,
  temperature: null,
  instructions: '',
  toolIds: [],
  documentIds: [],
}

interface Props {
  projectId: string
}

export default function AgentsCreate({ projectId }: Props) {
  const router = useRouter()
  const { storeAgents, fetchAgentsModels } = useAgentsControllers()
  const [form, setForm] = useState({ name: '', slug: '' })
  // Slug ikut nama selama belum pernah disunting sendiri.
  const [isSlugEdited, setSlugEdited] = useState(false)
  const [config, setConfig] = useState<AgentsConfigValue>(DEFAULT_CONFIG)

  const editConfig = (next: Partial<AgentsConfigValue>) =>
    setConfig((prev) => ({ ...prev, ...next }))

  const saveAgents = (event: React.FormEvent) => {
    event.preventDefault()

    storeAgents.mutate(
      {
        projectId,
        name: form.name.trim(),
        slug: (form.slug || getSlug(form.name)).trim(),
        description: '',
        ...config,
        instructions: config.instructions.trim(),
      },
      { onSuccess: (data) => router.push(`/console/agents/${data.id}`) }
    )
  }

  return (
    <form
      onSubmit={saveAgents}
      className="flex h-fit flex-col gap-4 rounded-xl border border-border bg-card p-6"
    >
      <h3 className="text-lg font-medium tracking-tight">
        Agent Baru
      </h3>

      <div className="flex flex-col gap-2">
        <Label htmlFor="agent-name">Nama</Label>
        <Input
          id="agent-name"
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              name: event.target.value,
              ...(isSlugEdited ? {} : { slug: getSlug(event.target.value) }),
            }))
          }
          placeholder="Accounting Assistant"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="agent-slug">Slug</Label>
        <Input
          id="agent-slug"
          value={form.slug}
          onChange={(event) => {
            setSlugEdited(true)
            setForm((prev) => ({ ...prev, slug: event.target.value }))
          }}
          placeholder="accounting-assistant"
        />
      </div>

      <AgentsConfigFields
        idPrefix="agent-create"
        value={config}
        models={fetchAgentsModels.data?.models ?? []}
        onChange={editConfig}
      />

      {storeAgents.isError ? (
        <p className="text-sm leading-relaxed text-destructive">
          {storeAgents.error.message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={
          storeAgents.isPending ||
          !form.name.trim() ||
          config.instructions.trim().length < 10
        }
      >
        {storeAgents.isPending ? 'Menyimpan…' : 'Buat Agent'}
      </Button>
    </form>
  )
}
