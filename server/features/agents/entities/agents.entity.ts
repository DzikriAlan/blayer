import type { AgentEffort, AgentProvider, AgentVersionStatus } from '@prisma/client'

export interface AgentsEntity {
  id: string
  projectId: string
  slug: string
  name: string
  description: string | null
  productionVersionId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AgentsVersionsEntity {
  id: string
  agentId: string
  version: number
  status: AgentVersionStatus
  instructions: string
  provider: AgentProvider
  model: string
  effort: AgentEffort
  maxTokens: number
  temperature: number | null
  publishedAt: Date | null
  createdAt: Date
}
