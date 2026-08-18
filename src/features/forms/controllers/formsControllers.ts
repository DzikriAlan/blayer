import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFormsStates } from '../states/formsStates'
import { getForms, getFormsDetail, postForms } from '../services/formsServices'
import type { PayloadPostForms } from '../types/formsTypes'

export const useFormsControllers = () => {
  const queryClient = useQueryClient()
  const {
    payloadGetFormsDetail,
    setForms,
    setFormsDetail,
    setFormsCreated,
  } = useFormsStates()

  const fetchForms = useQuery({
    queryKey: ['forms'],
    queryFn: () => getForms(),
  })

  const fetchFormsDetail = useQuery({
    queryKey: ['formsDetail', payloadGetFormsDetail],
    queryFn: () => getFormsDetail(payloadGetFormsDetail),
    enabled: !!payloadGetFormsDetail.id,
  })

  const storeForms = useMutation({
    mutationFn: (payload: PayloadPostForms) => postForms(payload),
    onMutate: () => {
      setFormsCreated({ status: 'loading' })
    },
    onSuccess: (data) => {
      setFormsCreated({ data: data ?? null, status: data ? 'success' : 'empty' })
      queryClient.invalidateQueries({ queryKey: ['forms'] })
    },
    onError: () => {
      setFormsCreated({ status: 'error' })
    },
  })

  useEffect(() => {
    if (fetchForms.isPending) return setForms({ status: 'loading' })
    if (fetchForms.isError) return setForms({ status: 'error' })

    const data = fetchForms.data ?? []
    setForms({ data, status: data.length ? 'success' : 'empty' })
  }, [
    fetchForms.data,
    fetchForms.isPending,
    fetchForms.isError,
    setForms,
  ])

  useEffect(() => {
    if (!payloadGetFormsDetail.id) return
    if (fetchFormsDetail.isPending) return setFormsDetail({ status: 'loading' })
    if (fetchFormsDetail.isError) return setFormsDetail({ status: 'error' })

    const data = fetchFormsDetail.data ?? null
    setFormsDetail({ data, status: data ? 'success' : 'empty' })
  }, [
    payloadGetFormsDetail.id,
    fetchFormsDetail.data,
    fetchFormsDetail.isPending,
    fetchFormsDetail.isError,
    setFormsDetail,
  ])

  return { fetchForms, fetchFormsDetail, storeForms }
}
