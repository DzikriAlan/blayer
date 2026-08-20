'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'

import { LoadData } from '@/shared/components/load-data'
import { useAuthStates } from '../states/authStates'
import { useAuthControllers } from '../controllers/authControllers'

const PUBLIC_PATHNAMES = [
  '/',
  '/login',
  '/register',
  '/auth/callback',
  '/forms/[id]',
  '/kategori/[id]',
  '/404',
  '/500',
  '/_error',
]

interface Props {
  children: React.ReactNode
}

export default function AuthGuard({ children }: Props) {
  const router = useRouter()
  const { authSession } = useAuthStates()
  useAuthControllers()

  const data = useMemo(() => {
    const isPublic = PUBLIC_PATHNAMES.includes(router.pathname)
    const isChecking = authSession.status === 'loading'
    const isError = authSession.status === 'error'
    const isSignedIn = authSession.status === 'success' && !!authSession.data

    return {
      isPublic,
      isChecking,
      isError,
      isSignedIn,
      isBlocked: !isPublic && !isChecking && !isError && !isSignedIn,
      errorTitle: 'Sesi Tidak Terbaca',
      errorSubtitle: authSession.statusSubtitle,
    }
  }, [router.pathname, authSession])

  useEffect(() => {
    if (!data.isBlocked) return

    router.replace(`/login?next=${encodeURIComponent(router.asPath)}`)
  }, [data.isBlocked, router])

  if (data.isPublic) return <>{children}</>

  if (data.isError) {
    return (
      <LoadData
        response={{
          isError: true,
          errorTitle: data.errorTitle,
          errorSubtitle: data.errorSubtitle,
        }}
        minHeight="100vh"
      />
    )
  }

  if (!data.isSignedIn) return <LoadData response={{ isLoading: true }} minHeight="100vh" />

  return <>{children}</>
}
