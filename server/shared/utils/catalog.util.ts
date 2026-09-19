import { AgentEffort, AgentProvider } from '@prisma/client'

export interface AgentModelItem {
  id: string
  provider: AgentProvider
  label: string
  contextWindow: number
  // Harga per satu juta token. null berarti tabel harganya tidak dipelihara di
  // repo ini, jadi biaya eksekusinya tidak dihitung — token tetap tercatat.
  inputUsdPerMTok: number | null
  outputUsdPerMTok: number | null
  supportsAdaptiveThinking: boolean
  supportsEffort: boolean
  supportsSampling: boolean
}

// Sumber harga dan kemampuan: dokumentasi resmi Claude API per 2026-06-24.
export const AGENT_MODELS: AgentModelItem[] = [
  {
    id: 'claude-opus-5',
    provider: AgentProvider.ANTHROPIC,
    label: 'Claude Opus 5',
    contextWindow: 1_000_000,
    inputUsdPerMTok: 5,
    outputUsdPerMTok: 25,
    supportsAdaptiveThinking: true,
    supportsEffort: true,
    supportsSampling: false,
  },
  {
    id: 'claude-sonnet-5',
    provider: AgentProvider.ANTHROPIC,
    label: 'Claude Sonnet 5',
    contextWindow: 1_000_000,
    inputUsdPerMTok: 2,
    outputUsdPerMTok: 10,
    supportsAdaptiveThinking: true,
    supportsEffort: true,
    supportsSampling: false,
  },
  {
    id: 'claude-fable-5-1',
    provider: AgentProvider.ANTHROPIC,
    label: 'Claude Fable 5.1',
    contextWindow: 1_000_000,
    inputUsdPerMTok: 10,
    outputUsdPerMTok: 50,
    // Penalaran selalu menyala di model ini, jadi parameter thinking justru
    // ditolak kalau dikirim.
    supportsAdaptiveThinking: false,
    supportsEffort: true,
    supportsSampling: false,
  },
  {
    id: 'claude-haiku-4-5',
    provider: AgentProvider.ANTHROPIC,
    label: 'Claude Haiku 4.5',
    contextWindow: 200_000,
    inputUsdPerMTok: 1,
    outputUsdPerMTok: 5,
    supportsAdaptiveThinking: false,
    supportsEffort: false,
    supportsSampling: true,
  },
]

export const DEFAULT_AGENT_MODEL = 'claude-opus-5'
export const DEFAULT_AGENT_PROVIDER = AgentProvider.ANTHROPIC
export const DEFAULT_MAX_TOKENS = 16_000
export const MIN_MAX_TOKENS = 256
export const MAX_MAX_TOKENS = 64_000

export const getAgentModel = (id: string) =>
  AGENT_MODELS.find((item) => item.id === id)

export const getProviderModels = (provider: AgentProvider) =>
  AGENT_MODELS.filter((item) => item.provider === provider)

// Katalog hanya mengikat provider yang kemampuannya dipelihara di sini. Provider
// lain menerima id model apa adanya supaya penambahan model baru di sisi vendor
// tidak menuntut rilis baru Blayer.
export const isKnownModel = (provider: AgentProvider, model: string) =>
  provider === AgentProvider.ANTHROPIC ? !!getAgentModel(model) : model.length > 0

export const getEffortLevel = (effort: AgentEffort) =>
  effort.toLowerCase() as 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export const getRunCostUsd = (
  model: string,
  inputTokens: number,
  outputTokens: number
) => {
  const item = getAgentModel(model)
  if (!item || item.inputUsdPerMTok === null || item.outputUsdPerMTok === null) {
    return null
  }

  const cost =
    (inputTokens / 1_000_000) * item.inputUsdPerMTok +
    (outputTokens / 1_000_000) * item.outputUsdPerMTok

  // Dibulatkan ke enam angka di belakang koma; satu eksekusi kecil tetap
  // terbaca, dan penjumlahan lintas eksekusi tidak menyeret galat float.
  return Math.round(cost * 1_000_000) / 1_000_000
}
