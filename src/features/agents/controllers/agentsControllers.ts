import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useConsoleStates } from '@/features/console/states/consoleStates'
import { useAgentsStates } from '../states/agentsStates'
import {
  getAgentsDetail,
  getAgentsModels,
  getAgentsRuns,
  postAgents,
  postAgentsPublish,
  postAgentsRun,
  postAgentsVersion,
} from '../services/agentsServices'
import type {
  PayloadPostAgents,
  PayloadPostAgentsPublish,
  PayloadPostAgentsRun,
  PayloadPostAgentsVersion,
} from '../types/agentsTypes'

export const useAgentsControllers = () => {
  const queryClient = useQueryClient()
  const { token } = useConsoleStates()
  const {
    payloadGetAgentsDetail,
    setAgentsDetail,
    setAgentsRuns,
    setPlaygroundResult,
  } = useAgentsStates()

  const agentId = payloadGetAgentsDetail.id

  const fetchAgentsDetail = useQuery({
    queryKey: ['agentsDetail', agentId],
    queryFn: () => getAgentsDetail(payloadGetAgentsDetail),
    enabled: !!token && !!agentId,
  })

  const fetchAgentsRuns = useQuery({
    queryKey: ['agentsRuns', agentId],
    queryFn: () => getAgentsRuns(payloadGetAgentsDetail),
    enabled: !!token && !!agentId,
  })

  const fetchAgentsModels = useQuery({
    queryKey: ['agentsModels'],
    queryFn: () => getAgentsModels(),
    enabled: !!token,
    staleTime: 60 * 60 * 1000,
  })

  const storeAgents = useMutation({
    mutationFn: (payload: PayloadPostAgents) => postAgents(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectsDetail'] })
    },
  })

  const storeAgentsVersion = useMutation({
    mutationFn: (payload: PayloadPostAgentsVersion) => postAgentsVersion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentsDetail'] })
    },
  })

  const storeAgentsPublish = useMutation({
    mutationFn: (payload: PayloadPostAgentsPublish) => postAgentsPublish(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentsDetail'] })
    },
  })

  const storeAgentsRun = useMutation({
    mutationFn: (payload: PayloadPostAgentsRun) => postAgentsRun(payload),
    onSuccess: (data) => {
      setPlaygroundResult(data)
      queryClient.invalidateQueries({ queryKey: ['agentsRuns'] })
    },
    onError: () => {
      // Eksekusi gagal tetap tercatat di server; riwayatnya disegarkan supaya
      // kegagalannya terlihat di daftar, bukan hanya sebagai pesan sesaat.
      setPlaygroundResult(null)
      queryClient.invalidateQueries({ queryKey: ['agentsRuns'] })
    },
  })

  useEffect(() => {
    if (!agentId) return
    if (fetchAgentsDetail.isPending) return setAgentsDetail({ status: 'loading' })

    if (fetchAgentsDetail.isError) {
      return setAgentsDetail({
        status: 'error',
        statusSubtitle: fetchAgentsDetail.error.message,
      })
    }

    const data = fetchAgentsDetail.data ?? null
    setAgentsDetail({ data, status: data ? 'success' : 'empty' })
  }, [
    agentId,
    fetchAgentsDetail.data,
    fetchAgentsDetail.isPending,
    fetchAgentsDetail.isError,
    fetchAgentsDetail.error,
    setAgentsDetail,
  ])

  useEffect(() => {
    if (!agentId) return
    if (fetchAgentsRuns.isPending) return setAgentsRuns({ status: 'loading' })

    if (fetchAgentsRuns.isError) {
      return setAgentsRuns({
        status: 'error',
        statusSubtitle: fetchAgentsRuns.error.message,
      })
    }

    const data = fetchAgentsRuns.data ?? null
    setAgentsRuns({ data, status: data?.runs.length ? 'success' : 'empty' })
  }, [
    agentId,
    fetchAgentsRuns.data,
    fetchAgentsRuns.isPending,
    fetchAgentsRuns.isError,
    fetchAgentsRuns.error,
    setAgentsRuns,
  ])

  return {
    fetchAgentsDetail,
    fetchAgentsRuns,
    fetchAgentsModels,
    storeAgents,
    storeAgentsVersion,
    storeAgentsPublish,
    storeAgentsRun,
  }
}
