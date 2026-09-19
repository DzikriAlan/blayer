'use client'

import { useState } from 'react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logo from '@/shared/images/logoblayer.png'
import { useConsoleControllers } from '../controllers/consoleControllers'

export default function ConsoleLogin() {
  const { storeConsoleLogin } = useConsoleControllers()
  const [form, setForm] = useState({ username: '', password: '' })

  const saveConsoleLogin = (event: React.FormEvent) => {
    event.preventDefault()

    storeConsoleLogin.mutate({
      username: form.username.trim(),
      password: form.password,
    })
  }

  return (
    <div className="relative flex min-h-[calc(100vh-3.6rem)] items-center justify-center px-5 py-16">
      <span
        aria-hidden
        className="glow-soft pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 blur-2xl"
      />

      <form
        onSubmit={saveConsoleLogin}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-7 shadow-lift"
      >
        <Image src={logo} alt="Blayer" className="h-8 w-auto" />

        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          Masuk Console
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Console ini milik operator instance. Sesinya berlaku 12 jam dan hanya
          disimpan di browser ini.
        </p>

        <div className="mt-7 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="console-username">Username</Label>
            <Input
              id="console-username"
              autoComplete="username"
              value={form.username}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, username: event.target.value }))
              }
              placeholder="admin"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="console-password">Kata sandi</Label>
            <Input
              id="console-password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="••••••••"
            />
          </div>

          {storeConsoleLogin.isError ? (
            <p className="text-sm leading-relaxed text-destructive">
              {storeConsoleLogin.error.message}
            </p>
          ) : null}

          <Button
            type="submit"
            className="mt-1 w-full"
            disabled={
              storeConsoleLogin.isPending ||
              !form.username.trim() ||
              !form.password
            }
          >
            {storeConsoleLogin.isPending ? 'Memeriksa…' : 'Masuk'}
          </Button>
        </div>
      </form>
    </div>
  )
}
