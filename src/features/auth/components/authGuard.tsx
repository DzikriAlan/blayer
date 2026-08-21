'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'

import { LoadData } from '@/shared/components/load-data'
import { useAuthStates } from '../states/authStates'
import { useAuthControllers } from '../controllers/authControllers'

/**
 * Halaman yang boleh dibuka tanpa login.
 *
 * Dicocokkan dengan `router.pathname`, bukan URL sebenarnya, supaya rute
 * dinamis cukup ditulis sekali. `/forms/[id]` sengaja publik: responden mengisi
 * form lewat tautan dan tidak boleh dipaksa punya akun (F-03). Halaman hasil
 * `/forms/[id]/result` pathname-nya berbeda, jadi tetap terkunci.
 */
const PUBLIC_PATHNAMES = [
  '/',
  '/login',
  '/register',
  '/auth/callback',
  // Pemulihan kata sandi harus terbuka tanpa sesi. Mengunci halaman ini di
  // belakang login berarti orang yang lupa kata sandinya diminta masuk dulu —
  // tepat hal yang sedang tidak bisa ia lakukan.
  '/auth/forgot-password',
  '/auth/reset-password',
  // Kebijakan privasi ditautkan dari footer dan dari form yang diisi responden
  // tanpa akun; pengungkapan yang hanya terbaca setelah masuk tidak ada
  // gunanya.
  '/privacy',
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
      // Sesi sudah selesai dibaca dan hasilnya kosong pada halaman terkunci.
      isBlocked: !isPublic && !isChecking && !isError && !isSignedIn,
      errorTitle: 'Sesi Tidak Terbaca',
      errorSubtitle: authSession.statusSubtitle,
    }
  }, [router.pathname, authSession])

  useEffect(() => {
    if (!data.isBlocked) return

    // Tujuan awal dititipkan supaya setelah login pengguna kembali ke halaman
    // yang tadi dibuka, bukan dilempar ke beranda.
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

  // Selama sesi belum pasti — atau pengguna sedang dilempar ke /login — isi
  // halaman tidak boleh ikut terender walau sekejap.
  if (!data.isSignedIn) return <LoadData response={{ isLoading: true }} minHeight="100vh" />

  return <>{children}</>
}
