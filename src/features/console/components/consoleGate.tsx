'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { getConsoleSession } from '@/shared/lib/consoleClient'
import { useConsoleStates } from '../states/consoleStates'
import { useConsoleControllers } from '../controllers/consoleControllers'
import ConsoleLogin from './consoleLogin'

interface Props {
  children: React.ReactNode
}

// Gerbang ini hanya menahan tampilan sampai ada sesi. Pemeriksaan sebenarnya
// tetap di server: tiap rute pengelolaan memeriksa tanda tangan dan masa berlaku
// tokennya sendiri.
export default function ConsoleGate({ children }: Props) {
  const { token, username, isReady, isDefaultCredentials, setSession, setReady } =
    useConsoleStates()
  const { removeConsoleSession } = useConsoleControllers()

  useEffect(() => {
    const session = getConsoleSession()

    if (session) setSession({ token: session.token, username: session.username })
    setReady(true)
  }, [setSession, setReady])

  if (!isReady) return null

  if (!token) return <ConsoleLogin />

  return (
    <>
      <div className="border-b-2 border-foreground bg-muted">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-2 sm:px-8">
          <span className="brutal-eyebrow text-muted-foreground">
            MASUK SEBAGAI {username.toUpperCase() || 'OPERATOR'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeConsoleSession}
          >
            Keluar
          </Button>
        </div>
      </div>

      {isDefaultCredentials ? (
        <div className="border-b-2 border-foreground bg-primary text-primary-foreground">
          <div className="mx-auto w-full max-w-6xl px-5 py-2 sm:px-8">
            <p className="brutal-eyebrow">
              KREDENSIAL MASIH BAWAAN — GANTI SEBELUM INSTANCE INI DIBUKA KE LUAR
            </p>
          </div>
        </div>
      ) : null}

      {children}
    </>
  )
}
