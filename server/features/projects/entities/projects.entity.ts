import type { AgentEnvironment, AgentProvider } from '@prisma/client'

export interface ProjectsEntity {
  id: string
  slug: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ProjectsKeysEntity {
  id: string
  projectId: string
  name: string
  environment: AgentEnvironment
  prefix: string
  lastUsedAt: Date | null
  revokedAt: Date | null
  createdAt: Date
}

export interface ProjectsCredentialsEntity {
  id: string
  projectId: string
  provider: AgentProvider
  environment: AgentEnvironment
  hint: string | null
  updatedAt: Date
}
