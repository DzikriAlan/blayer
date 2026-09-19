export type IntegrationsAuth = 'NONE' | 'BEARER' | 'HEADER'
export type IntegrationsMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type IntegrationsPermission = 'READ' | 'WRITE'

export interface DataIntegrationsTool {
  id: string
  integrationId: string
  name: string
  description: string
  method: IntegrationsMethod
  path: string
  permission: IntegrationsPermission
  inputSchema: unknown
  createdAt: string
}

export interface DataIntegrations {
  id: string
  slug: string
  name: string
  description: string
  baseUrl: string
  auth: IntegrationsAuth
  authHeader: string
  hint: string
  totalTools: number
  createdAt: string
  tools: DataIntegrationsTool[]
}

export interface DataIntegrationsDetail extends DataIntegrations {
  projectId: string
}

export interface PayloadGetIntegrations {
  projectId: string
}

export interface PayloadGetIntegrationsDetail {
  id: string
}

export interface PayloadPostIntegrations {
  projectId: string
  name: string
  slug: string
  description: string
  baseUrl: string
  auth: IntegrationsAuth
  authHeader: string
  secret: string
}

export interface PayloadPostIntegrationsTool {
  integrationId: string
  name: string
  description: string
  method: IntegrationsMethod
  path: string
  permission: IntegrationsPermission
  inputSchema: Record<string, unknown>
}

export interface PayloadDeleteIntegrationsTool {
  id: string
}

export interface Integrations {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataIntegrations[]
}

export interface IntegrationsDetail {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataIntegrationsDetail | null
}
