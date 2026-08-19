import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStates } from '@/features/auth/states/authStates'
import { useFormsStates } from '../states/formsStates'
import {
  getForms,
  getFormsDetail,
  getFormsPublic,
  postForms,
} from '../services/formsServices'
import type { PayloadPostForms } from '../types/formsTypes'

export const useFormsControllers = () => {
  const queryClient = useQueryClient()
  const { authSession } = useAuthStates()
  const {
    payloadGetFormsDetail,
    setForms,
    setFormsPublic,
    setFormsDetail,
    setFormsCreated,
  } = useFormsStates()

  // Daftar ini berisi form milik pemanggilnya, jadi tanpa sesi tidak ada yang
  // bisa dikembalikan. Menahannya di sini mencegah halaman publik menembakkan
  // request yang sudah pasti dibalas 401.
  const isSignedIn = authSession.status === 'success' && !!authSession.data

  const fetchForms = useQuery({
    queryKey: ['forms'],
    queryFn: () => getForms(),
    enabled: isSignedIn,
  })

  const fetchFormsPublic = useQuery({
    queryKey: ['formsPublic'],
    queryFn: () => getFormsPublic(),
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
    if (!isSignedIn) return setForms({ data: [], status: 'loading' })
    if (fetchForms.isPending) return setForms({ status: 'loading' })
    if (fetchForms.isError) return setForms({ status: 'error' })

    const data = fetchForms.data ?? []
    setForms({ data, status: data.length ? 'success' : 'empty' })
  }, [
    isSignedIn,
    fetchForms.data,
    fetchForms.isPending,
    fetchForms.isError,
    setForms,
  ])

  useEffect(() => {
    if (fetchFormsPublic.isPending) return setFormsPublic({ status: 'loading' })
    if (fetchFormsPublic.isError) return setFormsPublic({ status: 'error' })

    const data = fetchFormsPublic.data ?? []
    setFormsPublic({ data, status: data.length ? 'success' : 'empty' })
  }, [
    fetchFormsPublic.data,
    fetchFormsPublic.isPending,
    fetchFormsPublic.isError,
    setFormsPublic,
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

  return { fetchForms, fetchFormsPublic, fetchFormsDetail, storeForms }
}
