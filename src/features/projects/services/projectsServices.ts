import { consoleFetch } from '@/shared/lib/consoleClient'
import type {
  DataProjects,
  DataProjectsCreatedKey,
  DataProjectsDetail,
  PayloadGetProjectsDetail,
  PayloadPostProjects,
  PayloadPostProjectsKey,
  PayloadPutProjectsCredential,
} from '../types/projectsTypes'

export const getProjects = () => consoleFetch<DataProjects[]>('/projects')

export const getProjectsDetail = ({ id }: PayloadGetProjectsDetail) =>
  consoleFetch<DataProjectsDetail>(`/projects/${id}`)

export const postProjects = (payload: PayloadPostProjects) =>
  consoleFetch<{ id: string }>('/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const postProjectsKey = ({
  projectId,
  ...payload
}: PayloadPostProjectsKey) =>
  consoleFetch<DataProjectsCreatedKey>(`/projects/${projectId}/keys`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const putProjectsCredential = ({
  projectId,
  ...payload
}: PayloadPutProjectsCredential) =>
  consoleFetch<{ id: string }>(`/projects/${projectId}/credentials`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
