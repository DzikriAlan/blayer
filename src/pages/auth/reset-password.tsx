import { useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { LoaderCircle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { postAuthResetPassword } from '@/features/auth/services/authServices'

const ResetPassword: NextPage = () => {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.')
      return
    }

    setIsPending(true)
    setErrorMsg('')
    try {
      await postAuthResetPassword(password)
      setIsSuccess(true)
      setTimeout(() => {
        router.push('/forms')
      }, 2000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memperbarui kata sandi.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <Head>
        <title>Atur Ulang Kata Sandi — BLAYER</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex h-[100dvh] items-center justify-center overflow-hidden bg-background px-5 py-6">
        <div className="max-h-full w-full max-w-md overflow-y-auto border-2 border-foreground bg-paper p-6 shadow-[6px_6px_0_0_hsl(var(--foreground))] sm:p-8">
          <p className="brutal-eyebrow text-muted-foreground">ATUR ULANG SANDI</p>
          <h1 className="mt-2 font-display text-3xl font-black uppercase leading-[0.95] tracking-tight sm:mt-3 sm:text-4xl">
            Sandi<br />Baru<span className="text-primary">.</span>
          </h1>

          {isSuccess ? (
            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="size-12 text-primary" />
              <p className="font-mono text-sm leading-relaxed text-foreground">
                Kata sandi Anda berhasil diperbarui! Mengalihkan ke dashboard...
              </p>
            </div>
          ) : (
            <>
              <p className="mt-3 font-mono text-sm leading-relaxed text-muted-foreground sm:mt-4">
                Masukkan kata sandi baru untuk akun Anda.
              </p>
              <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Kata Sandi Baru</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {errorMsg ? (
                  <p role="alert" className="border-2 border-foreground bg-destructive/10 p-3 font-mono text-xs leading-relaxed">
                    {errorMsg}
                  </p>
                ) : null}

                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
                  {isPending ? 'Simpan…' : 'Simpan Kata Sandi Baru'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default ResetPassword
