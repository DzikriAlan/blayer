export type ProviderEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface ProviderRunInput {
  apiKey: string
  model: string
  instructions: string
  input: string
  maxTokens: number
  effort: ProviderEffort
  temperature: number | null
}

export interface ProviderRunResult {
  text: string
  inputTokens: number
  outputTokens: number
  stopReason: string
}

// Kegagalan provider dipetakan ke satu bentuk supaya lapisan runtime tidak perlu
// tahu bentuk error tiap vendor, dan pemanggil tetap menerima kode yang sama.
export class ProviderError extends Error {
  readonly code: string
  readonly status: number

  constructor(code: string, message: string, status = 502) {
    super(message)
    this.name = 'ProviderError'
    this.code = code
    this.status = status
  }
}

export type ProviderAdapter = (
  input: ProviderRunInput
) => Promise<ProviderRunResult>

export const PROVIDER_TIMEOUT_MS = 60_000
