import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useConsoleStates } from '@/features/console/states/consoleStates'
import { useProjectsStates } from '@/features/projects/states/projectsStates'
import { useKnowledgeStates } from '../states/knowledgeStates'
import {
  deleteKnowledge,
  getKnowledge,
  postKnowledge,
} from '../services/knowledgeServices'
import type {
  PayloadDeleteKnowledge,
  PayloadPostKnowledge,
} from '../types/knowledgeTypes'

export const useKnowledgeControllers = () => {
  const queryClient = useQueryClient()
  const { token } = useConsoleStates()
  const { payloadGetProjectsDetail } = useProjectsStates()
  const { setKnowledge } = useKnowledgeStates()

  const projectId = payloadGetProjectsDetail.id

  const fetchKnowledge = useQuery({
    queryKey: ['knowledge', projectId],
    queryFn: () => getKnowledge({ projectId }),
    enabled: !!token && !!projectId,
  })

  const storeKnowledge = useMutation({
    mutationFn: (payload: PayloadPostKnowledge) => postKnowledge(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    },
  })

  const removeKnowledge = useMutation({
    mutationFn: (payload: PayloadDeleteKnowledge) => deleteKnowledge(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    },
  })

  useEffect(() => {
    if (!projectId) return
    if (fetchKnowledge.isPending) return setKnowledge({ status: 'loading' })

    if (fetchKnowledge.isError) {
      return setKnowledge({
        status: 'error',
        statusSubtitle: fetchKnowledge.error.message,
      })
    }

    const data = fetchKnowledge.data ?? []
    setKnowledge({ data, status: data.length ? 'success' : 'empty' })
  }, [
    projectId,
    fetchKnowledge.data,
    fetchKnowledge.isPending,
    fetchKnowledge.isError,
    fetchKnowledge.error,
    setKnowledge,
  ])

  return { fetchKnowledge, storeKnowledge, removeKnowledge }
}
