'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  PASSWORD_MIN,
  USERNAME_MAX,
  USERNAME_MIN,
  USERNAME_PATTERN,
} from '@/shared/lib/authIdentity'
import { useAuthStates } from '../states/authStates'
import { useAuthControllers } from '../controllers/authControllers'

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN, `Username minimal ${USERNAME_MIN} karakter.`)
    .max(USERNAME_MAX, `Username maksimal ${USERNAME_MAX} karakter.`)
    .regex(
      USERNAME_PATTERN,
      'Username hanya boleh huruf, angka, titik, garis bawah, dan strip.'
    ),
  password: z
    .string()
    .min(PASSWORD_MIN, `Kata sandi minimal ${PASSWORD_MIN} karakter.`),
})

type FormValues = z.infer<typeof schema>

/**
 * Tujuan hanya diterima bila berupa path internal.
 *
 * Tanpa saringan ini, `?next=https://situs-lain` akan membuat halaman login
 * sendiri jadi alat pengalihan ke domain luar.
 */
const getSafeNext = (next: unknown) => {
  if (typeof next !== 'string') return ''
  if (!next.startsWith('/') || next.startsWith('//')) return ''
  return next
}

interface Props {
  mode: 'login' | 'register'
}

export default function AuthForm({ mode }: Props) {
  const router = useRouter()
  const { authSession } = useAuthStates()
  const { storeAuthSession, storeAuthPassword, storeAuthRegister } =
    useAuthControllers()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  const data = useMemo(() => {
    const isRegister = mode === 'register'
    const credential = isRegister ? storeAuthRegister : storeAuthPassword
    const isSignedIn = authSession.status === 'success' && !!authSession.data

    return {
      isRegister,
      next: getSafeNext(router.query.next) || '/forms',
      isSignedIn,
      // Tiga tombol punya keadaan sibuk sendiri-sendiri supaya yang berputar
      // hanya tombol yang benar-benar sedang bekerja.
      isCredentialPending: credential.isPending,
      isGooglePending: storeAuthSession.isPending,
      isBusy:
        credential.isPending ||
        storeAuthSession.isPending ||
        authSession.status === 'loading',
      credentialError:
        credential.error instanceof Error ? credential.error.message : '',
      eyebrow: isRegister ? 'BUAT AKUN' : 'AKSES TERBATAS',
      title: isRegister ? ['Daftar', 'Dulu'] : ['Masuk', 'Dulu'],
      lead: isRegister
        ? 'Buat akun untuk mulai menyusun form. Form yang Anda buat hanya terlihat oleh akun Anda sendiri.'
        : 'Membuat form dan membuka dashboard hasil butuh akun. Mengisi form lewat tautan publik tetap bisa tanpa login.',
      submitLabel: isRegister ? 'Daftar' : 'Masuk',
      googleLabel: isRegister ? 'Daftar dengan Google' : 'Lanjut dengan Google',
      switchLead: isRegister ? 'Sudah punya akun?' : 'Belum punya akun?',
      switchLabel: isRegister ? 'Masuk' : 'Daftar',
      switchHref: `${isRegister ? '/login' : '/register'}${
        router.query.next ? `?next=${encodeURIComponent(String(router.query.next))}` : ''
      }`,
    }
  }, [
    mode,
    router.query.next,
    authSession,
    storeAuthPassword,
    storeAuthRegister,
    storeAuthSession.isPending,
  ])

  const submitAuthPassword = form.handleSubmit((values) => {
    if (data.isRegister) return storeAuthRegister.mutate(values)
    storeAuthPassword.mutate(values)
  })

  const submitAuthGoogle = () => {
    storeAuthSession.mutate({ next: data.next })
  }

  useEffect(() => {
    if (!data.isSignedIn) return

    // Sudah punya sesi — halaman ini tidak perlu ditampilkan lagi.
    router.replace(data.next)
  }, [data.isSignedIn, data.next, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-md border-2 border-foreground bg-paper p-8 shadow-[6px_6px_0_0_hsl(var(--foreground))]">
        <p className="brutal-eyebrow text-muted-foreground">{data.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight">
          {data.title[0]}
          <br />
          {data.title[1]}
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
          {data.lead}
        </p>

        <form onSubmit={submitAuthPassword} className="mt-7 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="blayeradmin"
              aria-invalid={!!form.formState.errors.username}
              {...form.register('username')}
            />
            {form.formState.errors.username ? (
              <p className="font-mono text-xs text-destructive">
                {form.formState.errors.username.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              type="password"
              autoComplete={
                data.isRegister ? 'new-password' : 'current-password'
              }
              placeholder="••••••••"
              aria-invalid={!!form.formState.errors.password}
              {...form.register('password')}
            />
            {form.formState.errors.password ? (
              <p className="font-mono text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          {data.credentialError ? (
            <p
              role="alert"
              className="border-2 border-foreground bg-destructive/10 p-3 font-mono text-xs leading-relaxed"
            >
              {data.credentialError}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={data.isBusy}>
            {data.isCredentialPending ? (
              <LoaderCircle className="animate-spin" aria-hidden />
            ) : null}
            {data.isCredentialPending ? 'Memproses…' : data.submitLabel}
          </Button>
        </form>

        <div className="my-7 flex items-center gap-4">
          <span aria-hidden className="h-0.5 flex-1 bg-foreground" />
          <span className="brutal-eyebrow text-muted-foreground">ATAU</span>
          <span aria-hidden className="h-0.5 flex-1 bg-foreground" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={data.isBusy}
          onClick={submitAuthGoogle}
        >
          {data.isGooglePending ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : null}
          {data.isGooglePending ? 'Menghubungkan…' : data.googleLabel}
        </Button>

        {authSession.status === 'error' ? (
          <p
            role="alert"
            className="mt-4 border-2 border-foreground bg-destructive/10 p-3 font-mono text-xs leading-relaxed"
          >
            {authSession.statusSubtitle}
          </p>
        ) : null}

        <p className="mt-7 font-mono text-xs text-muted-foreground">
          {data.switchLead}{' '}
          <Link
            href={data.switchHref}
            className="font-bold text-foreground underline underline-offset-4 hover:text-primary"
          >
            {data.switchLabel}
          </Link>
        </p>
      </div>
    </div>
  )
}
