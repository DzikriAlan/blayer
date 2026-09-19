import { AgentProvider } from '@prisma/client'

import { runAnthropic } from './anthropic.provider'
import { runOpenai } from './openai.provider'
import type { ProviderAdapter } from './provider.types'

const ADAPTERS: Record<AgentProvider, ProviderAdapter> = {
  [AgentProvider.ANTHROPIC]: runAnthropic,
  [AgentProvider.OPENAI]: runOpenai,
}

export const getProviderAdapter = (provider: AgentProvider) => ADAPTERS[provider]

export { ProviderError } from './provider.types'
export type {
  ProviderAdapter,
  ProviderEffort,
  ProviderRunInput,
  ProviderRunResult,
} from './provider.types'
