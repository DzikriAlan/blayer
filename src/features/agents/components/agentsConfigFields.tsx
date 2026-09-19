'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type {
  AgentsConfigValue,
  AgentsEffort,
  AgentsProvider,
  DataAgentsModel,
} from '../types/agentsTypes'

const EFFORTS: AgentsEffort[] = ['LOW', 'MEDIUM', 'HIGH', 'XHIGH', 'MAX']
const PROVIDERS: AgentsProvider[] = ['ANTHROPIC', 'OPENAI']

export const SELECT_CLASS =
  'h-11 w-full border-2 border-foreground bg-paper px-3 font-mono text-xs uppercase tracking-[0.14em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

interface Props {
  value: AgentsConfigValue
  models: DataAgentsModel[]
  idPrefix: string
  onChange: (value: Partial<AgentsConfigValue>) => void
}

// Katalog hanya memuat model yang kemampuannya dipelihara di repo ini. Provider
// di luar itu memakai isian bebas, jadi model baru di sisi vendor tidak menunggu
// rilis Blayer.
export default function AgentsConfigFields({
  value,
  models,
  idPrefix,
  onChange,
}: Props) {
  const providerModels = models.filter((item) => item.provider === value.provider)
  const selected = models.find((item) => item.id === value.model)

  const editProvider = (provider: AgentsProvider) => {
    const fallback = models.find((item) => item.provider === provider)

    onChange({ provider, model: fallback ? fallback.id : '' })
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-provider`}>Provider</Label>
          <select
            id={`${idPrefix}-provider`}
            className={SELECT_CLASS}
            value={value.provider}
            onChange={(event) =>
              editProvider(event.target.value as AgentsProvider)
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
          <Label htmlFor={`${idPrefix}-model`}>Model</Label>
          {providerModels.length ? (
            <select
              id={`${idPrefix}-model`}
              className={SELECT_CLASS}
              value={value.model}
              onChange={(event) => onChange({ model: event.target.value })}
            >
              {providerModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id={`${idPrefix}-model`}
              value={value.model}
              placeholder="id model di sisi provider"
              onChange={(event) => onChange({ model: event.target.value })}
            />
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-effort`}>Effort</Label>
          <select
            id={`${idPrefix}-effort`}
            className={SELECT_CLASS}
            disabled={!!selected && !selected.supportsEffort}
            value={value.effort}
            onChange={(event) =>
              onChange({ effort: event.target.value as AgentsEffort })
            }
          >
            {EFFORTS.map((effort) => (
              <option key={effort} value={effort}>
                {effort}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-max-tokens`}>Batas token</Label>
          <Input
            id={`${idPrefix}-max-tokens`}
            type="number"
            min={256}
            max={64000}
            value={value.maxTokens}
            onChange={(event) =>
              onChange({ maxTokens: Number(event.target.value) })
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-temperature`}>Temperature</Label>
          <Input
            id={`${idPrefix}-temperature`}
            type="number"
            step="0.1"
            min={0}
            max={2}
            disabled={!!selected && !selected.supportsSampling}
            value={value.temperature ?? ''}
            placeholder="bawaan model"
            onChange={(event) =>
              onChange({
                temperature:
                  event.target.value === '' ? null : Number(event.target.value),
              })
            }
          />
        </div>
      </div>

      {selected && !selected.supportsSampling ? (
        <p className="font-mono text-xs leading-relaxed text-muted-foreground">
          {selected.label} tidak menerima temperature — isian itu diabaikan
          supaya permintaannya tidak ditolak provider.
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-instructions`}>Instructions</Label>
        <Textarea
          id={`${idPrefix}-instructions`}
          rows={10}
          value={value.instructions}
          placeholder="Jelaskan tugas agent, batasannya, dan bentuk jawabannya."
          onChange={(event) => onChange({ instructions: event.target.value })}
        />
      </div>
    </>
  )
}
