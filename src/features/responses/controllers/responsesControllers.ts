import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useResponsesStates } from '../states/responsesStates'
import {
  getResponsesList,
  postResponses,
} from '../services/responsesServices'
import type { PayloadPostResponses } from '../types/responsesTypes'

export const useResponsesControllers = () => {
  const queryClient = useQueryClient()
  const {
    payloadGetResponsesList,
    setResponses,
    setResponsesList,
  } = useResponsesStates()

  const fetchResponsesList = useQuery({
    queryKey: ['responsesList', payloadGetResponsesList],
    queryFn: () => getResponsesList(payloadGetResponsesList),
    enabled: !!payloadGetResponsesList.formId,
  })

  const storeResponses = useMutation({
    mutationFn: (payload: PayloadPostResponses) => postResponses(payload),
    onMutate: () => {
      setResponses({ status: 'loading' })
    },
    onSuccess: (data) => {
      setResponses({ data: data ?? null, status: data ? 'success' : 'empty' })
      queryClient.invalidateQueries({ queryKey: ['responsesList'] })
    },
    onError: () => {
      setResponses({ status: 'error' })
    },
  })

  useEffect(() => {
    if (!payloadGetResponsesList.formId) return
    if (fetchResponsesList.isPending)
      return setResponsesList({ status: 'loading' })
    if (fetchResponsesList.isError) return setResponsesList({ status: 'error' })

    const data = fetchResponsesList.data ?? null
    setResponsesList({
      data,
      status: data?.responses?.length ? 'success' : 'empty',
    })
  }, [
    payloadGetResponsesList.formId,
    fetchResponsesList.data,
    fetchResponsesList.isPending,
    fetchResponsesList.isError,
    setResponsesList,
  ])

  return { fetchResponsesList, storeResponses }
}
