import { consoleFetch } from '@/shared/lib/consoleClient'
import type {
  DataKnowledge,
  PayloadDeleteKnowledge,
  PayloadGetKnowledge,
  PayloadPostKnowledge,
} from '../types/knowledgeTypes'

export const getKnowledge = ({ projectId }: PayloadGetKnowledge) =>
  consoleFetch<DataKnowledge[]>(`/projects/${projectId}/knowledge`)

export const postKnowledge = ({ projectId, ...payload }: PayloadPostKnowledge) =>
  consoleFetch<{ id: string }>(`/projects/${projectId}/knowledge`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const deleteKnowledge = ({ id }: PayloadDeleteKnowledge) =>
  consoleFetch<{ id: string }>(`/knowledge/${id}`, { method: 'DELETE' })
