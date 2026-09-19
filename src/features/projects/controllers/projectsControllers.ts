import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useConsoleStates } from '@/features/console/states/consoleStates'
import { useProjectsStates } from '../states/projectsStates'
import {
  getProjects,
  getProjectsDetail,
  postProjects,
  postProjectsKey,
  putProjectsCredential,
} from '../services/projectsServices'
import type {
  PayloadPostProjects,
  PayloadPostProjectsKey,
  PayloadPutProjectsCredential,
} from '../types/projectsTypes'

export const useProjectsControllers = () => {
  const queryClient = useQueryClient()
  const { token } = useConsoleStates()
  const {
    payloadGetProjectsDetail,
    setProjects,
    setProjectsDetail,
    setCreatedKey,
  } = useProjectsStates()

  const fetchProjects = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
    enabled: !!token,
  })

  const fetchProjectsDetail = useQuery({
    queryKey: ['projectsDetail', payloadGetProjectsDetail.id],
    queryFn: () => getProjectsDetail(payloadGetProjectsDetail),
    enabled: !!token && !!payloadGetProjectsDetail.id,
  })

  const storeProjects = useMutation({
    mutationFn: (payload: PayloadPostProjects) => postProjects(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const storeProjectsKey = useMutation({
    mutationFn: (payload: PayloadPostProjectsKey) => postProjectsKey(payload),
    onSuccess: (data) => {
      setCreatedKey(data)
      queryClient.invalidateQueries({ queryKey: ['projectsDetail'] })
    },
  })

  const updateProjectsCredential = useMutation({
    mutationFn: (payload: PayloadPutProjectsCredential) =>
      putProjectsCredential(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectsDetail'] })
    },
  })

  useEffect(() => {
    if (fetchProjects.isPending) return setProjects({ status: 'loading' })

    if (fetchProjects.isError) {
      return setProjects({
        status: 'error',
        statusSubtitle: fetchProjects.error.message,
      })
    }

    const data = fetchProjects.data ?? []
    setProjects({ data, status: data.length ? 'success' : 'empty' })
  }, [
    fetchProjects.data,
    fetchProjects.isPending,
    fetchProjects.isError,
    fetchProjects.error,
    setProjects,
  ])

  useEffect(() => {
    if (!payloadGetProjectsDetail.id) return
    if (fetchProjectsDetail.isPending) {
      return setProjectsDetail({ status: 'loading' })
    }

    if (fetchProjectsDetail.isError) {
      return setProjectsDetail({
        status: 'error',
        statusSubtitle: fetchProjectsDetail.error.message,
      })
    }

    const data = fetchProjectsDetail.data ?? null
    setProjectsDetail({ data, status: data ? 'success' : 'empty' })
  }, [
    payloadGetProjectsDetail.id,
    fetchProjectsDetail.data,
    fetchProjectsDetail.isPending,
    fetchProjectsDetail.isError,
    fetchProjectsDetail.error,
    setProjectsDetail,
  ])

  return {
    fetchProjects,
    fetchProjectsDetail,
    storeProjects,
    storeProjectsKey,
    updateProjectsCredential,
  }
}
