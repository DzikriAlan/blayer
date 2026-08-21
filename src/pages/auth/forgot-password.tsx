import { useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { LoaderCircle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ForgotPassword: NextPage = () => {
  const [username, setUsername] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [sentMessage, setSentMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsPending(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/v1/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        setErrorMsg(json?.message ?? 'Gagal memproses permintaan.')
        return
      }

      setSentMessage(json?.message ?? '')
      setIsSent(true)
    } catch {
      setErrorMsg('Gagal menghubungi server.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <Head>
        <title>Pemulihan Akun — BLAYER</title>
        <meta name="description" content="Minta tautan pemulihan kata sandi akun Blayer." />
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex h-[100dvh] items-center justify-center overflow-hidden bg-background px-5 py-6">
        <div className="max-h-full w-full max-w-md overflow-y-auto border-2 border-foreground bg-paper p-6 shadow-[6px_6px_0_0_hsl(var(--foreground))] sm:p-8">
          <p className="brutal-eyebrow text-muted-foreground">PEMULIHAN AKUN</p>
          <h1 className="mt-2 font-display text-3xl font-black uppercase leading-[0.95] tracking-tight sm:mt-3 sm:text-4xl">
            Lupa<br />Sandi<span className="text-primary">.</span>
          </h1>

          {isSent ? (
            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="size-12 text-primary" />
              <p className="font-mono text-sm leading-relaxed text-foreground">
                {sentMessage}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                Periksa kotak masuk maupun folder spam.
              </p>
              <Link href="/login" className="mt-4">
                <Button variant="outline">Kembali ke Halaman Masuk</Button>
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-3 font-mono text-sm leading-relaxed text-muted-foreground sm:mt-4">
                Masukkan username akunmu. Tautan pemulihan dikirim ke alamat
                email yang sudah kamu daftarkan sebagai alamat pemulihan.
              </p>
              <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    placeholder="adminblayer"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                {errorMsg ? (
                  <p role="alert" className="border-2 border-foreground bg-destructive/10 p-3 font-mono text-xs leading-relaxed">
                    {errorMsg}
                  </p>
                ) : null}

                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
                  {isPending ? 'Mengirim…' : 'Kirim Tautan Pemulihan'}
                </Button>
              </form>

              <p className="mt-6 font-mono text-xs text-muted-foreground">
                Kembali ke{' '}
                <Link href="/login" className="font-bold text-foreground underline underline-offset-4 hover:text-primary">
                  Halaman Masuk
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default ForgotPassword
