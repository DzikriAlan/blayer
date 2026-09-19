import { describe, expect, it } from 'vitest'
import { AgentEffort, AgentProvider } from '@prisma/client'

import {
  AGENT_MODELS,
  DEFAULT_AGENT_MODEL,
  getAgentModel,
  getEffortLevel,
  getProviderModels,
  getRunCostUsd,
  isKnownModel,
} from '@server/shared/utils/catalog.util'

describe('katalog model', () => {
  it('TC-52a model bawaan ada di katalog', () => {
    expect(getAgentModel(DEFAULT_AGENT_MODEL)).toBeDefined()
  })

  it('TC-52b tiap entri punya id unik dan jendela konteks yang masuk akal', () => {
    const ids = AGENT_MODELS.map((model) => model.id)

    expect(new Set(ids).size).toBe(ids.length)
    AGENT_MODELS.forEach((model) => {
      expect(model.contextWindow).toBeGreaterThan(0)
      expect(model.label.length).toBeGreaterThan(0)
    })
  })

  it('TC-52c model Anthropic wajib dikenal katalog, provider lain bebas', () => {
    expect(isKnownModel(AgentProvider.ANTHROPIC, DEFAULT_AGENT_MODEL)).toBe(true)
    expect(isKnownModel(AgentProvider.ANTHROPIC, 'claude-tidak-ada')).toBe(false)
    expect(isKnownModel(AgentProvider.OPENAI, 'model-baru-kemarin')).toBe(true)
    expect(isKnownModel(AgentProvider.OPENAI, '')).toBe(false)
  })

  it('TC-52d menyaring katalog per provider', () => {
    const models = getProviderModels(AgentProvider.ANTHROPIC)

    expect(models.length).toBeGreaterThan(0)
    models.forEach((model) => expect(model.provider).toBe(AgentProvider.ANTHROPIC))
  })
})

describe('biaya eksekusi', () => {
  it('TC-53a menghitung biaya dari harga per satu juta token', () => {
    // Opus 5: $5 per 1M token masukan, $25 per 1M token keluaran.
    expect(getRunCostUsd('claude-opus-5', 1_000_000, 1_000_000)).toBe(30)
    expect(getRunCostUsd('claude-opus-5', 1_000, 500)).toBeCloseTo(0.0175, 6)
  })

  it('TC-53b tidak mengarang biaya untuk model yang harganya tidak dipelihara', () => {
    expect(getRunCostUsd('model-pihak-ketiga', 1_000, 1_000)).toBeNull()
  })

  it('TC-53c eksekusi tanpa token berbiaya nol, bukan null', () => {
    expect(getRunCostUsd('claude-opus-5', 0, 0)).toBe(0)
  })
})

describe('tingkat effort', () => {
  it('TC-54a memakai ejaan yang diterima API provider', () => {
    expect(getEffortLevel(AgentEffort.XHIGH)).toBe('xhigh')
    expect(getEffortLevel(AgentEffort.MEDIUM)).toBe('medium')
  })
})
