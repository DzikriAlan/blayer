import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useConsoleStates } from '@/features/console/states/consoleStates'
import { useProjectsStates } from '@/features/projects/states/projectsStates'
import { useIntegrationsStates } from '../states/integrationsStates'
import {
  deleteIntegrationsTool,
  getIntegrations,
  getIntegrationsDetail,
  postIntegrations,
  postIntegrationsTool,
} from '../services/integrationsServices'
import type {
  PayloadDeleteIntegrationsTool,
  PayloadPostIntegrations,
  PayloadPostIntegrationsTool,
} from '../types/integrationsTypes'

export const useIntegrationsControllers = () => {
  const queryClient = useQueryClient()
  const { token } = useConsoleStates()
  const { payloadGetProjectsDetail } = useProjectsStates()
  const {
    payloadGetIntegrationsDetail,
    setIntegrations,
    setIntegrationsDetail,
  } = useIntegrationsStates()

  const projectId = payloadGetProjectsDetail.id
  const integrationId = payloadGetIntegrationsDetail.id

  const fetchIntegrations = useQuery({
    queryKey: ['integrations', projectId],
    queryFn: () => getIntegrations({ projectId }),
    enabled: !!token && !!projectId,
  })

  const fetchIntegrationsDetail = useQuery({
    queryKey: ['integrationsDetail', integrationId],
    queryFn: () => getIntegrationsDetail({ id: integrationId }),
    enabled: !!token && !!integrationId,
  })

  const storeIntegrations = useMutation({
    mutationFn: (payload: PayloadPostIntegrations) => postIntegrations(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
  })

  const storeIntegrationsTool = useMutation({
    mutationFn: (payload: PayloadPostIntegrationsTool) =>
      postIntegrationsTool(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrationsDetail'] })
    },
  })

  const removeIntegrationsTool = useMutation({
    mutationFn: (payload: PayloadDeleteIntegrationsTool) =>
      deleteIntegrationsTool(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrationsDetail'] })
    },
  })

  useEffect(() => {
    if (!projectId) return
    if (fetchIntegrations.isPending) return setIntegrations({ status: 'loading' })

    if (fetchIntegrations.isError) {
      return setIntegrations({
        status: 'error',
        statusSubtitle: fetchIntegrations.error.message,
      })
    }

    const data = fetchIntegrations.data ?? []
    setIntegrations({ data, status: data.length ? 'success' : 'empty' })
  }, [
    projectId,
    fetchIntegrations.data,
    fetchIntegrations.isPending,
    fetchIntegrations.isError,
    fetchIntegrations.error,
    setIntegrations,
  ])

  useEffect(() => {
    if (!integrationId) return
    if (fetchIntegrationsDetail.isPending) {
      return setIntegrationsDetail({ status: 'loading' })
    }

    if (fetchIntegrationsDetail.isError) {
      return setIntegrationsDetail({
        status: 'error',
        statusSubtitle: fetchIntegrationsDetail.error.message,
      })
    }

    const data = fetchIntegrationsDetail.data ?? null
    setIntegrationsDetail({ data, status: data ? 'success' : 'empty' })
  }, [
    integrationId,
    fetchIntegrationsDetail.data,
    fetchIntegrationsDetail.isPending,
    fetchIntegrationsDetail.isError,
    fetchIntegrationsDetail.error,
    setIntegrationsDetail,
  ])

  return {
    fetchIntegrations,
    fetchIntegrationsDetail,
    storeIntegrations,
    storeIntegrationsTool,
    removeIntegrationsTool,
  }
}
