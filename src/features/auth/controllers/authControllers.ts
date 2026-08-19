import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStates } from '../states/authStates'
import {
  deleteAuthSession,
  getAuthSession,
  getAuthSessionChanges,
  postAuthPassword,
  postAuthRegister,
  postAuthSession,
} from '../services/authServices'
import type {
  PayloadPostAuthPassword,
  PayloadPostAuthRegister,
  PayloadPostAuthSession,
} from '../types/authTypes'

export const useAuthControllers = () => {
  const queryClient = useQueryClient()
  const { setAuthSession } = useAuthStates()

  const fetchAuthSession = useQuery({
    queryKey: ['authSession'],
    queryFn: () => getAuthSession(),
    // Sesi sudah dijaga sinkron oleh listener di bawah, jadi tidak perlu
    // ditarik ulang berkala. Gagal baca sesi juga tidak layak diulang —
    // penyebabnya konfigurasi, bukan jaringan yang sesaat.
    staleTime: Infinity,
    retry: false,
  })

  const storeAuthSession = useMutation({
    mutationFn: (payload: PayloadPostAuthSession) => postAuthSession(payload),
    onMutate: () => {
      setAuthSession({ status: 'loading' })
    },
    onError: (error) => {
      setAuthSession({
        status: 'error',
        statusSubtitle:
          error instanceof Error && error.message
            ? error.message
            : 'Login lewat Google gagal. Coba lagi sebentar lagi.',
      })
    },
  })

  const storeAuthPassword = useMutation({
    mutationFn: (payload: PayloadPostAuthPassword) => postAuthPassword(payload),
    onSuccess: () => {
      // Sesi baru harus dibaca ulang dari Supabase, bukan disusun dari payload —
      // yang menentukan pengguna masuk atau tidak adalah token, bukan form.
      queryClient.invalidateQueries({ queryKey: ['authSession'] })
    },
  })

  const storeAuthRegister = useMutation({
    mutationFn: (payload: PayloadPostAuthRegister) => postAuthRegister(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authSession'] })
    },
  })

  const removeAuthSession = useMutation({
    mutationFn: () => deleteAuthSession(),
    onSuccess: () => {
      setAuthSession({ data: null, status: 'empty' })
      queryClient.setQueryData(['authSession'], null)
    },
    onError: () => {
      setAuthSession({ status: 'error' })
    },
  })

  useEffect(() => {
    if (fetchAuthSession.isPending) return setAuthSession({ status: 'loading' })
    if (fetchAuthSession.isError) {
      return setAuthSession({
        status: 'error',
        statusSubtitle:
          fetchAuthSession.error instanceof Error &&
          fetchAuthSession.error.message
            ? fetchAuthSession.error.message
            : 'Sesi login tidak bisa dibaca. Coba muat ulang halaman.',
      })
    }

    const data = fetchAuthSession.data ?? null
    setAuthSession({ data, status: data ? 'success' : 'empty' })
  }, [
    fetchAuthSession.data,
    fetchAuthSession.isPending,
    fetchAuthSession.isError,
    fetchAuthSession.error,
    setAuthSession,
  ])

  useEffect(() => {
    return getAuthSessionChanges((data) => {
      queryClient.setQueryData(['authSession'], data)
    })
  }, [queryClient])

  return {
    fetchAuthSession,
    storeAuthSession,
    storeAuthPassword,
    storeAuthRegister,
    removeAuthSession,
  }
}
