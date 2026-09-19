import type {
  ProjectsEnvironment,
  ProjectsProvider,
} from '@/features/projects/types/projectsTypes'

export type AgentsEnvironment = ProjectsEnvironment
export type AgentsProvider = ProjectsProvider
export type AgentsEffort = 'LOW' | 'MEDIUM' | 'HIGH' | 'XHIGH' | 'MAX'
export type AgentsVersionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type AgentsRunStatus = 'SUCCEEDED' | 'FAILED'

export interface DataAgentsModel {
  id: string
  provider: AgentsProvider
  label: string
  contextWindow: number
  inputUsdPerMTok: number | null
  outputUsdPerMTok: number | null
  supportsAdaptiveThinking: boolean
  supportsEffort: boolean
  supportsSampling: boolean
}

export interface DataAgentsVersion {
  id: string
  version: number
  status: AgentsVersionStatus
  instructions: string
  provider: AgentsProvider
  model: string
  effort: AgentsEffort
  maxTokens: number
  temperature: number | null
  isProduction: boolean
  publishedAt: string
  createdAt: string
}

export interface DataAgentsDetail {
  id: string
  slug: string
  name: string
  description: string
  projectId: string
  projectName: string
  productionVersionId: string
  createdAt: string
  versions: DataAgentsVersion[]
}

export interface DataAgentsRun {
  id: string
  version: number
  environment: AgentsEnvironment
  status: AgentsRunStatus
  provider: AgentsProvider
  model: string
  input: string
  output: string
  errorCode: string
  errorMessage: string
  inputTokens: number
  outputTokens: number
  costUsd: number | null
  latencyMs: number
  createdAt: string
}

export interface DataAgentsRunSummary {
  totalRuns: number
  successRate: number
  avgLatencyMs: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCostUsd: number
}

export interface DataAgentsRunHistory {
  summary: DataAgentsRunSummary
  runs: DataAgentsRun[]
}

export interface DataAgentsRunResult {
  runId: string
  agentId: string
  version: number
  versionId: string
  environment: AgentsEnvironment
  provider: AgentsProvider
  model: string
  output: string
  stopReason: string
  latencyMs: number
  inputTokens: number
  outputTokens: number
  costUsd: number | null
}

export interface PayloadGetAgentsDetail {
  id: string
}

export interface PayloadPostAgents {
  projectId: string
  name: string
  slug: string
  description: string
  instructions: string
  provider: AgentsProvider
  model: string
  effort: AgentsEffort
  maxTokens: number
  temperature: number | null
}

export interface PayloadPostAgentsVersion {
  agentId: string
  instructions: string
  provider: AgentsProvider
  model: string
  effort: AgentsEffort
  maxTokens: number
  temperature: number | null
}

export interface PayloadPostAgentsPublish {
  agentId: string
  versionId: string
}

export interface PayloadPostAgentsRun {
  agentId: string
  input: string
  versionId: string
  environment: AgentsEnvironment
}

export interface AgentsDetail {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataAgentsDetail | null
}

export interface AgentsRuns {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataAgentsRunHistory | null
}

export interface AgentsConfigValue {
  provider: AgentsProvider
  model: string
  effort: AgentsEffort
  maxTokens: number
  temperature: number | null
  instructions: string
}
