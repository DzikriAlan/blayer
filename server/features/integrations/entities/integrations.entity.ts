import type { IntegrationAuth, ToolMethod, ToolPermission } from '@prisma/client'

export interface IntegrationsEntity {
  id: string
  projectId: string
  slug: string
  name: string
  description: string | null
  baseUrl: string
  auth: IntegrationAuth
  authHeader: string | null
  hint: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IntegrationsToolsEntity {
  id: string
  integrationId: string
  name: string
  description: string
  method: ToolMethod
  path: string
  permission: ToolPermission
  inputSchema: unknown
  createdAt: Date
}
