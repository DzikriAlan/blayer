import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import AgentsConfigFields from '@/features/agents/components/agentsConfigFields'
import type {
  AgentsConfigValue,
  DataAgentsModel,
} from '@/features/agents/types/agentsTypes'

const MODELS: DataAgentsModel[] = [
  {
    id: 'claude-opus-5',
    provider: 'ANTHROPIC',
    label: 'Claude Opus 5',
    contextWindow: 1_000_000,
    inputUsdPerMTok: 5,
    outputUsdPerMTok: 25,
    supportsAdaptiveThinking: true,
    supportsEffort: true,
    supportsSampling: false,
  },
  {
    id: 'claude-haiku-4-5',
    provider: 'ANTHROPIC',
    label: 'Claude Haiku 4.5',
    contextWindow: 200_000,
    inputUsdPerMTok: 1,
    outputUsdPerMTok: 5,
    supportsAdaptiveThinking: false,
    supportsEffort: false,
    supportsSampling: true,
  },
]

const getValue = (overrides: Partial<AgentsConfigValue> = {}): AgentsConfigValue => ({
  provider: 'ANTHROPIC',
  model: 'claude-opus-5',
  effort: 'HIGH',
  maxTokens: 16_000,
  temperature: null,
  instructions: 'Jawab hanya dari hasil tool.',
  ...overrides,
})

const renderFields = (value: AgentsConfigValue) => {
  const onChange = vi.fn()

  render(
    <AgentsConfigFields
      idPrefix="uji"
      value={value}
      models={MODELS}
      onChange={onChange}
    />
  )

  return { onChange }
}

describe('isian konfigurasi agent', () => {
  it('TC-67a mengunci temperature untuk model yang menolaknya', () => {
    renderFields(getValue())

    expect(screen.getByLabelText('Temperature')).toBeDisabled()
    expect(screen.getByText(/tidak menerima temperature/i)).toBeInTheDocument()
  })

  it('TC-67b membuka temperature untuk model yang menerimanya', () => {
    renderFields(getValue({ model: 'claude-haiku-4-5' }))

    expect(screen.getByLabelText('Temperature')).toBeEnabled()
    expect(screen.getByLabelText('Effort')).toBeDisabled()
  })

  it('TC-67c menawarkan model katalog sebagai pilihan, bukan ketikan bebas', () => {
    renderFields(getValue())

    const model = screen.getByLabelText('Model')

    expect(model.tagName).toBe('SELECT')
    expect(screen.getByRole('option', { name: 'Claude Opus 5' })).toBeInTheDocument()
  })

  it('TC-67d beralih ke isian bebas untuk provider di luar katalog', () => {
    renderFields(getValue({ provider: 'OPENAI', model: '' }))

    expect(screen.getByLabelText('Model').tagName).toBe('INPUT')
  })

  it('TC-67e mengganti model bawaan saat providernya berganti', async () => {
    const { onChange } = renderFields(getValue({ provider: 'OPENAI', model: 'x' }))

    await userEvent.selectOptions(screen.getByLabelText('Provider'), 'ANTHROPIC')

    expect(onChange).toHaveBeenCalledWith({
      provider: 'ANTHROPIC',
      model: 'claude-opus-5',
    })
  })

  it('TC-67f mengosongkan temperature saat isiannya dikosongkan', async () => {
    const { onChange } = renderFields(getValue({ model: 'claude-haiku-4-5', temperature: 0.5 }))

    await userEvent.clear(screen.getByLabelText('Temperature'))

    expect(onChange).toHaveBeenCalledWith({ temperature: null })
  })
})
