export type ProjectsEnvironment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'
export type ProjectsProvider = 'ANTHROPIC' | 'OPENAI'

export interface DataProjects {
  id: string
  slug: string
  name: string
  description: string
  totalAgents: number
  totalApiKeys: number
  createdAt: string
}

export interface DataProjectsAgent {
  id: string
  slug: string
  name: string
  description: string
  isPublished: boolean
  totalVersions: number
  totalRuns: number
  createdAt: string
}

export interface DataProjectsApiKey {
  id: string
  name: string
  environment: ProjectsEnvironment
  prefix: string
  lastUsedAt: string
  isRevoked: boolean
  createdAt: string
}

export interface DataProjectsCredential {
  id: string
  provider: ProjectsProvider
  environment: ProjectsEnvironment
  hint: string
  updatedAt: string
}

export interface DataProjectsDetail {
  id: string
  slug: string
  name: string
  description: string
  createdAt: string
  agents: DataProjectsAgent[]
  apiKeys: DataProjectsApiKey[]
  providerKeys: DataProjectsCredential[]
}

export interface DataProjectsCreatedKey {
  id: string
  name: string
  environment: ProjectsEnvironment
  prefix: string
  token: string
}

export interface PayloadPostProjects {
  name: string
  slug: string
  description: string
}

export interface PayloadGetProjectsDetail {
  id: string
}

export interface PayloadPostProjectsKey {
  projectId: string
  name: string
  environment: ProjectsEnvironment
}

export interface PayloadPutProjectsCredential {
  projectId: string
  provider: ProjectsProvider
  environment: ProjectsEnvironment
  secret: string
}

export interface Projects {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataProjects[]
}

export interface ProjectsDetail {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataProjectsDetail | null
}
