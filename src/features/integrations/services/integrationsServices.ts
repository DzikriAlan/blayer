import { consoleFetch } from '@/shared/lib/consoleClient'
import type {
  DataIntegrations,
  DataIntegrationsDetail,
  PayloadDeleteIntegrationsTool,
  PayloadGetIntegrations,
  PayloadGetIntegrationsDetail,
  PayloadPostIntegrations,
  PayloadPostIntegrationsTool,
} from '../types/integrationsTypes'

export const getIntegrations = ({ projectId }: PayloadGetIntegrations) =>
  consoleFetch<DataIntegrations[]>(`/projects/${projectId}/integrations`)

export const getIntegrationsDetail = ({ id }: PayloadGetIntegrationsDetail) =>
  consoleFetch<DataIntegrationsDetail>(`/integrations/${id}`)

export const postIntegrations = ({
  projectId,
  ...payload
}: PayloadPostIntegrations) =>
  consoleFetch<{ id: string }>(`/projects/${projectId}/integrations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const postIntegrationsTool = ({
  integrationId,
  ...payload
}: PayloadPostIntegrationsTool) =>
  consoleFetch<{ id: string }>(`/integrations/${integrationId}/tools`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const deleteIntegrationsTool = ({ id }: PayloadDeleteIntegrationsTool) =>
  consoleFetch<{ id: string }>(`/tools/${id}`, { method: 'DELETE' })
