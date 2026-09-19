import { AgentProvider } from '@prisma/client'

import { runAnthropic } from './providerAnthropic'
import { runOpenai } from './providerOpenai'
import type { ProviderAdapter } from './providerTypes'

const ADAPTERS: Record<AgentProvider, ProviderAdapter> = {
  [AgentProvider.ANTHROPIC]: runAnthropic,
  [AgentProvider.OPENAI]: runOpenai,
}

export const getProviderAdapter = (provider: AgentProvider) => ADAPTERS[provider]

export { ProviderError } from './providerTypes'
export type {
  ProviderAdapter,
  ProviderEffort,
  ProviderRunInput,
  ProviderRunResult,
} from './providerTypes'
