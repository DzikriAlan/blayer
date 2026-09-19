import { consoleFetch } from '@/shared/lib/consoleClient'
import type {
  DataAgentsDetail,
  DataAgentsModel,
  DataAgentsRunHistory,
  DataAgentsRunResult,
  PayloadGetAgentsDetail,
  PayloadPostAgents,
  PayloadPostAgentsPublish,
  PayloadPostAgentsRun,
  PayloadPostAgentsVersion,
} from '../types/agentsTypes'

export const getAgentsDetail = ({ id }: PayloadGetAgentsDetail) =>
  consoleFetch<DataAgentsDetail>(`/agents/${id}`)

export const getAgentsRuns = ({ id }: PayloadGetAgentsDetail) =>
  consoleFetch<DataAgentsRunHistory>(`/agents/${id}/runs`)

export const getAgentsModels = () =>
  consoleFetch<{ defaultModel: string; models: DataAgentsModel[] }>('/models')

export const postAgents = (payload: PayloadPostAgents) =>
  consoleFetch<{ id: string }>('/agents', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const postAgentsVersion = ({
  agentId,
  ...payload
}: PayloadPostAgentsVersion) =>
  consoleFetch<{ id: string; version: number }>(`/agents/${agentId}/versions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const postAgentsPublish = ({
  agentId,
  ...payload
}: PayloadPostAgentsPublish) =>
  consoleFetch<{ versionId: string; version: number }>(
    `/agents/${agentId}/publish`,
    { method: 'POST', body: JSON.stringify(payload) }
  )

export const postAgentsRun = ({ agentId, ...payload }: PayloadPostAgentsRun) =>
  consoleFetch<DataAgentsRunResult>(`/agents/${agentId}/run`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
