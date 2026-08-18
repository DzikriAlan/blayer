import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAnalysisStates } from '../states/analysisStates'
import { getAnalysis, postAnalysis } from '../services/analysisServices'
import type { PayloadPostAnalysis } from '../types/analysisTypes'

export const useAnalysisControllers = () => {
  const { payloadGetAnalysis, setAnalysis } = useAnalysisStates()

  const fetchAnalysis = useQuery({
    queryKey: ['analysis', payloadGetAnalysis],
    queryFn: () => getAnalysis(payloadGetAnalysis),
    enabled: !!payloadGetAnalysis.formId,
  })

  const storeAnalysis = useMutation({
    mutationFn: (payload: PayloadPostAnalysis) => postAnalysis(payload),
    onMutate: () => {
      setAnalysis({ status: 'loading' })
    },
    onSuccess: (data) => {
      setAnalysis({ data: data ?? null, status: data ? 'success' : 'empty' })
    },
    onError: (error) => {
      setAnalysis({
        status: 'error',
        statusSubtitle:
          error instanceof Error ? error.message : 'Please try again later.',
      })
    },
  })

  useEffect(() => {
    if (!payloadGetAnalysis.formId) return
    // Jangan timpa hasil analisis yang baru saja dijalankan lewat mutation.
    if (storeAnalysis.isPending || storeAnalysis.isSuccess) return
    if (fetchAnalysis.isPending) return setAnalysis({ status: 'loading' })
    if (fetchAnalysis.isError) return setAnalysis({ status: 'error' })

    const data = fetchAnalysis.data ?? null
    setAnalysis({ data, status: data ? 'success' : 'empty' })
  }, [
    payloadGetAnalysis.formId,
    fetchAnalysis.data,
    fetchAnalysis.isPending,
    fetchAnalysis.isError,
    storeAnalysis.isPending,
    storeAnalysis.isSuccess,
    setAnalysis,
  ])

  return { fetchAnalysis, storeAnalysis }
}
