'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getLoginProblem,
  getPasswordProblem,
  getUsernameProblem,
} from '@/shared/lib/authIdentity'
import { useAuthStates } from '../states/authStates'
import { useAuthControllers } from '../controllers/authControllers'

/**
 * Aturannya tidak ditulis ulang sebagai rantai zod supaya browser dan API route
 * menolak dengan kalimat yang sama persis. Salinan yang terpisah sempat membuat
 * isian berupa email lengkap dijelaskan sebagai masalah karakter di sini,
 * padahal penyebabnya domain yang ditempel dua kali.
 */
const check =
  (getProblem: (value: string) => string) =>
  (value: string, ctx: z.RefinementCtx) => {
    const problem = getProblem(value)
    if (problem) ctx.addIssue({ code: z.ZodIssueCode.custom, message: problem })
  }

/**
 * Masuk menerima username maupun alamat email, sedangkan mendaftar hanya
 * menerima username.
 *
 * Bedanya disengaja: saat mendaftar alamatnya memang dibentuk dari username,
 * jadi membiarkan isian berupa email di sana hanya akan membuat akun dengan
 * alamat ganda. Saat masuk, akunnya sudah ada dan yang dibutuhkan cuma cara
 * menemukannya.
 */
const getSchema = (isRegister: boolean) =>
  z.object({
    // Spasi di ujung dibuang di sini juga, supaya nilai yang terkirim sama
    // dengan nilai yang barusan divalidasi.
    username: z
      .string()
      .trim()
      .superRefine(check(isRegister ? getUsernameProblem : getLoginProblem)),
    password: z.string().superRefine(check(getPasswordProblem)),
  })

type FormValues = z.infer<ReturnType<typeof getSchema>>

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

  // Kata sandi di sini tidak bisa dipulihkan lewat email, karena alamatnya
  // sintetis. Bisa memeriksa apa yang diketik jauh lebih berarti daripada di
  // form login biasa.
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(getSchema(mode === 'register')),
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
      fieldLabel: isRegister ? 'Username' : 'Username atau Email',
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
    <div className="flex h-[100dvh] items-center justify-center overflow-hidden bg-background px-5 py-6">
      <div className="max-h-full w-full max-w-md overflow-y-auto border-2 border-foreground bg-paper p-6 shadow-[6px_6px_0_0_hsl(var(--foreground))] sm:p-8">
        <p className="brutal-eyebrow text-muted-foreground">{data.eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-black uppercase leading-[0.95] tracking-tight sm:mt-3 sm:text-4xl">
          {data.title[0]}
          <br />
          {data.title[1]}
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-mono text-sm leading-relaxed text-muted-foreground sm:mt-4">
          {data.lead}
        </p>

        <form onSubmit={submitAuthPassword} className="mt-5 flex flex-col gap-3 sm:mt-6 sm:gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">{data.fieldLabel}</Label>
            <Input
              id="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="adminblayer"
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
            <div className="relative">
              <Input
                id="password"
                type={isPasswordShown ? 'text' : 'password'}
                autoComplete={
                  data.isRegister ? 'new-password' : 'current-password'
                }
                placeholder="••••••••"
                // Ruang untuk tombol mata, supaya sandi panjang tidak tertimpa.
                className="pr-10"
                aria-invalid={!!form.formState.errors.password}
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setIsPasswordShown((shown) => !shown)}
                // Tanpa type="button" tombol ini akan ikut mengirim form, dan
                // memeriksa ketikan justru berujung percobaan login.
                aria-label={
                  isPasswordShown
                    ? 'Sembunyikan kata sandi'
                    : 'Tampilkan kata sandi'
                }
                aria-pressed={isPasswordShown}
                aria-controls="password"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
              >
                {isPasswordShown ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {form.formState.errors.password ? (
              <p className="font-mono text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            ) : null}
            {!data.isRegister ? (
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="font-mono text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
                >
                  Lupa kata sandi?
                </Link>
              </div>
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

        <div className="my-5 flex items-center gap-4 sm:my-6">
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

        <p className="mt-5 font-mono text-xs text-muted-foreground sm:mt-6">
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
