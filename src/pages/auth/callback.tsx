import { useEffect, useMemo } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { LoadData } from '@/shared/components/load-data'
import { useAuthStates } from '@/features/auth/states/authStates'
import { useAuthControllers } from '@/features/auth/controllers/authControllers'

/**
 * Halaman pendaratan setelah Google.
 *
 * Client Supabase membaca sendiri kode yang menempel di URL, jadi halaman ini
 * hanya menunggu sesi terbaca lalu meneruskan ke tujuan yang tadi dititipkan.
 */
const AuthCallback: NextPage = () => {
  const router = useRouter()
  const { authSession } = useAuthStates()
  useAuthControllers()

  const data = useMemo(() => {
    const getSafeNext = (next: unknown) => {
      if (typeof next !== 'string') return ''
      if (!next.startsWith('/') || next.startsWith('//')) return ''
      return next
    }

    // Google ikut menempelkan `error` di URL bila pengguna membatalkan izin.
    const isRejected = typeof router.query.error === 'string'

    return {
      next: getSafeNext(router.query.next) || '/forms',
      isRejected,
      isChecking: !isRejected && authSession.status === 'loading',
      isSignedIn: authSession.status === 'success' && !!authSession.data,
      isFailed: isRejected || authSession.status === 'error',
      errorSubtitle: isRejected
        ? 'Izin Google tidak diberikan, jadi sesi tidak dibuat. Coba masuk sekali lagi.'
        : authSession.statusSubtitle,
    }
  }, [router.query.next, router.query.error, authSession])

  useEffect(() => {
    if (!router.isReady) return
    if (data.isChecking || data.isFailed) return

    // Halaman callback tidak boleh tersimpan di riwayat — tombol back mesti
    // mengembalikan pengguna ke halaman sebelum login, bukan ke sini.
    router.replace(data.isSignedIn ? data.next : '/login')
  }, [router, data.isChecking, data.isFailed, data.isSignedIn, data.next])

  return (
    <>
      <Head>
        <title>Menyiapkan Sesi — BLAYER</title>
        <meta name="robots" content="noindex" />
      </Head>
      <LoadData
        response={{
          isLoading: !data.isFailed,
          isError: data.isFailed,
          errorTitle: 'Login Tidak Selesai',
          errorSubtitle: data.errorSubtitle,
        }}
        minHeight="100vh"
      />
    </>
  )
}

export default AuthCallback
