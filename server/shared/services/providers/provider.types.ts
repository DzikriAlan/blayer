export type ProviderEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface ProviderTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface ProviderToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

// Satu bentuk percakapan untuk semua provider. Adaptor yang menerjemahkannya ke
// bentuk masing-masing vendor, sehingga runtime tidak perlu tahu bedanya.
export interface ProviderMessage {
  role: 'user' | 'assistant' | 'tool'
  content: string
  toolCalls?: ProviderToolCall[]
  toolCallId?: string
  isError?: boolean
}

export interface ProviderRunInput {
  apiKey: string
  model: string
  instructions: string
  messages: ProviderMessage[]
  tools: ProviderTool[]
  maxTokens: number
  effort: ProviderEffort
  temperature: number | null
}

export interface ProviderRunResult {
  text: string
  toolCalls: ProviderToolCall[]
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
