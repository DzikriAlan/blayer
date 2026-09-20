'use client'

import { useEffect } from 'react'

import { getConsoleSession } from '@/shared/lib/consoleClient'
import { useConsoleStates } from '../states/consoleStates'
import ConsoleLogin from './consoleLogin'

interface Props {
  children: React.ReactNode
}

// Gerbang ini hanya menahan tampilan sampai ada sesi. Pemeriksaan sebenarnya
// tetap di server: tiap rute pengelolaan memeriksa tanda tangan dan masa berlaku
// tokennya sendiri.
export default function ConsoleGate({ children }: Props) {
  const { token, isReady, isDefaultCredentials, setSession, setReady } =
    useConsoleStates()

  useEffect(() => {
    const session = getConsoleSession()

    if (session) setSession({ token: session.token, username: session.username })
    setReady(true)
  }, [setSession, setReady])

  if (!isReady) return null

  if (!token) return <ConsoleLogin />

  return (
    <>
      {isDefaultCredentials ? (
        <div className="border-b border-primary/30 bg-primary/10 px-5 py-2.5 sm:px-8">
          <p className="text-sm text-primary">
            Kredensial masih bawaan — ganti sebelum instance ini dibuka ke luar.
          </p>
        </div>
      ) : null}

      {children}
    </>
  )
}
