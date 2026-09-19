'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  clearConsoleToken,
  getConsoleToken,
  setConsoleToken,
} from '@/shared/lib/consoleClient'
import { useConsoleStates } from '../states/consoleStates'

interface Props {
  children: React.ReactNode
}

// Rute pengelolaan diperiksa di server lewat BLAYER_ADMIN_TOKEN. Gerbang ini
// hanya menahan tampilan sampai tokennya ada, bukan pengganti pemeriksaan itu.
export default function ConsoleGate({ children }: Props) {
  const { token, isReady, setToken, setReady } = useConsoleStates()
  const [draft, setDraft] = useState('')

  useEffect(() => {
    setToken(getConsoleToken())
    setReady(true)
  }, [setToken, setReady])

  const saveToken = (event: React.FormEvent) => {
    event.preventDefault()
    const next = draft.trim()
    if (!next) return

    setConsoleToken(next)
    setToken(next)
    setDraft('')
  }

  const removeToken = () => {
    clearConsoleToken()
    setToken('')
  }

  if (!isReady) return null

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 sm:px-8">
        <div className="border-2 border-foreground bg-paper p-6">
          <h1 className="font-display text-2xl font-black uppercase leading-none tracking-tight">
            Token Pengelolaan
          </h1>
          <p className="mt-4 font-mono text-xs leading-relaxed text-muted-foreground">
            Console ini memakai <code>BLAYER_ADMIN_TOKEN</code> milik instance
            kamu sendiri. Tokennya disimpan di browser ini saja dan dikirim
            sebagai header Authorization ke tiap permintaan.
          </p>

          <form onSubmit={saveToken} className="mt-6 flex flex-col gap-3">
            <Label htmlFor="console-token">Token</Label>
            <Input
              id="console-token"
              type="password"
              autoComplete="off"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="isi BLAYER_ADMIN_TOKEN"
            />
            <Button type="submit" disabled={!draft.trim()}>
              Masuk Console
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="border-b-2 border-foreground bg-muted">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-2 sm:px-8">
          <span className="brutal-eyebrow text-muted-foreground">
            TOKEN PENGELOLAAN AKTIF
          </span>
          <Button type="button" variant="outline" size="sm" onClick={removeToken}>
            Lupakan Token
          </Button>
        </div>
      </div>
      {children}
    </>
  )
}
