'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuthStates } from '../states/authStates'
import { useAuthControllers } from '../controllers/authControllers'

interface Props {
  tone?: 'light' | 'dark'
}

export default function AuthAccount({ tone = 'light' }: Props) {
  const router = useRouter()
  const { authSession } = useAuthStates()
  const { removeAuthSession } = useAuthControllers()

  const data = useMemo(() => {
    const getInitial = (name: string, email: string) =>
      (name || email || '?').trim().charAt(0).toUpperCase()

    const session = authSession.data

    return {
      isChecking: authSession.status === 'loading',
      isSignedIn: authSession.status === 'success' && !!session,
      name: session?.name || session?.email || '',
      initial: getInitial(session?.name ?? '', session?.email ?? ''),
      isPending: removeAuthSession.isPending,
      buttonVariant: tone === 'dark' ? ('paper' as const) : ('outline' as const),
    }
  }, [authSession, removeAuthSession.isPending, tone])

  const clearAuthSession = () => {
    removeAuthSession.mutate(undefined, {
      onSuccess: () => router.replace('/'),
    })
  }

  if (data.isChecking) return null

  if (!data.isSignedIn) {
    return (
      <Button asChild variant={data.buttonVariant} size="sm">
        <Link href={`/login?next=${encodeURIComponent(router.asPath)}`}>
          Masuk
        </Link>
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-current font-mono text-xs font-bold"
      >
        {data.initial}
      </span>
      <span className="brutal-eyebrow hidden max-w-[140px] truncate sm:inline">
        {data.name}
      </span>
      <Button
        type="button"
        variant={data.buttonVariant}
        size="icon"
        aria-label="Keluar"
        disabled={data.isPending}
        onClick={clearAuthSession}
      >
        <LogOut />
      </Button>
    </div>
  )
}
