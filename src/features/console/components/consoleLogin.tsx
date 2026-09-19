'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <div className="mx-auto w-full max-w-md px-5 py-20 sm:px-8">
      <form
        onSubmit={saveConsoleLogin}
        className="flex flex-col gap-5 border-2 border-foreground bg-paper p-6"
      >
        <div>
          <h1 className="font-display text-2xl font-black uppercase leading-none tracking-tight">
            Masuk Console
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-4 font-mono text-xs leading-relaxed text-muted-foreground">
            Console ini milik operator instance. Sesinya hanya disimpan di
            browser ini dan berlaku 12 jam.
          </p>
        </div>

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
          <p className="font-mono text-xs leading-relaxed text-primary">
            {storeConsoleLogin.error.message}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={
            storeConsoleLogin.isPending ||
            !form.username.trim() ||
            !form.password
          }
        >
          {storeConsoleLogin.isPending ? 'Memeriksa…' : 'Masuk'}
        </Button>
      </form>
    </div>
  )
}
