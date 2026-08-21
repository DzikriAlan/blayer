'use client'

import { useCallback, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { LoaderCircle, MailCheck, MailWarning } from 'lucide-react'

import PageShell from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAuthHeaders } from '@/shared/lib/authClient'

const CONFIRM_MESSAGE: Record<string, string> = {
  terkonfirmasi: 'Alamat pemulihan sudah dikonfirmasi.',
  kedaluwarsa: 'Tautan konfirmasi sudah kedaluwarsa. Daftarkan ulang alamatnya.',
  'tidak-cocok': 'Tautan konfirmasi tidak cocok. Daftarkan ulang alamatnya.',
  'tidak-dikenal': 'Tautan konfirmasi tidak dikenal.',
  'tidak-lengkap': 'Tautan konfirmasi tidak lengkap.',
  gagal: 'Konfirmasi gagal disimpan. Coba lagi.',
}

const Akun: NextPage = () => {
  const router = useRouter()
  const [state, setState] = useState({
    email: '',
    password: '',
    saved: '',
    isVerified: false,
    isLoading: true,
    isPending: false,
    error: '',
    notice: '',
  })

  const loadStatus = useCallback(async () => {
    const res = await fetch('/api/v1/auth/recovery-email', {
      headers: { ...(await getAuthHeaders()) },
    })

    if (!res.ok) {
      setState((prev) => ({ ...prev, isLoading: false }))
      return
    }

    const json = await res.json()
    setState((prev) => ({
      ...prev,
      saved: json.recoveryEmail ?? '',
      isVerified: !!json.isVerified,
      isLoading: false,
    }))
  }, [])

  useEffect(() => {
    // Dibungkus supaya panggilannya jelas asinkron: hasilnya menyusul, bukan
    // setState yang berjalan langsung di badan effect.
    const load = async () => {
      await loadStatus()
    }

    load()
  }, [loadStatus])

  // Pesan dari tautan konfirmasi diturunkan saat render, tidak disimpan sebagai
  // state. Menyalin nilai yang sudah ada di URL ke dalam state hanya menambah
  // satu render dan satu sumber kebenaran kedua yang bisa menyimpang.
  const confirmNotice = router.isReady
    ? CONFIRM_MESSAGE[String(router.query.pemulihan ?? '')] ?? ''
    : ''

  const notice = state.notice || confirmNotice

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setState((prev) => ({ ...prev, isPending: true, error: '', notice: '' }))

    try {
      const res = await fetch('/api/v1/auth/recovery-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({ email: state.email, password: state.password }),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          isPending: false,
          error: json?.message ?? 'Gagal menyimpan alamat pemulihan.',
        }))
        return
      }

      setState((prev) => ({
        ...prev,
        isPending: false,
        password: '',
        email: '',
        saved: json.recoveryEmail,
        isVerified: false,
        notice: 'Surat konfirmasi terkirim. Buka tautannya untuk mengaktifkan.',
      }))
    } catch {
      setState((prev) => ({
        ...prev,
        isPending: false,
        error: 'Gagal menghubungi server.',
      }))
    }
  }

  return (
    <>
      <Head>
        <title>Akun — BLAYER</title>
        <meta name="robots" content="noindex" />
      </Head>
      <PageShell barTitle="AKUN" backHref="/forms" railWord="AKUN" railNote="RECOVERY">
        <h1 className="font-display text-3xl font-black uppercase leading-none tracking-tight">
          Alamat Pemulihan<span className="text-primary">.</span>
        </h1>

        <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
          Kamu masuk memakai username, dan alamat internal yang dibuat darinya
          tidak bisa menerima surat. Daftarkan satu alamat email yang benar-benar
          kamu buka, supaya kata sandi masih bisa dipulihkan kalau suatu saat
          lupa.
        </p>

        {state.isLoading ? null : (
          <div className="mt-6 flex items-start gap-3 border-2 border-foreground bg-paper p-4">
            {state.saved && state.isVerified ? (
              <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            ) : (
              <MailWarning className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            )}
            <p className="font-mono text-sm leading-relaxed">
              {state.saved
                ? `${state.saved} — ${
                    state.isVerified ? 'sudah dikonfirmasi' : 'menunggu konfirmasi'
                  }`
                : 'Belum ada alamat pemulihan. Kalau lupa kata sandi sekarang, akunnya tidak bisa dipulihkan.'}
            </p>
          </div>
        )}

        {notice ? (
          <p className="mt-4 border-2 border-foreground bg-muted p-3 font-mono text-xs leading-relaxed">
            {notice}
          </p>
        ) : null}

        <form onSubmit={submit} className="mt-7 flex max-w-md flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="recovery-email">Alamat Email</Label>
            <Input
              id="recovery-email"
              type="email"
              autoComplete="email"
              placeholder="nama@domain.com"
              value={state.email}
              onChange={(event) =>
                setState((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="current-password">Kata Sandi Saat Ini</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={state.password}
              onChange={(event) =>
                setState((prev) => ({ ...prev, password: event.target.value }))
              }
            />
            <p className="font-mono text-xs text-muted-foreground">
              Diminta ulang supaya perangkat yang tertinggal terbuka tidak bisa
              memindahkan alamat pemulihan ke alamat orang lain.
            </p>
          </div>

          {state.error ? (
            <p role="alert" className="font-mono text-xs text-destructive">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={state.isPending}>
            {state.isPending ? (
              <>
                <LoaderCircle className="animate-spin" /> Menyimpan…
              </>
            ) : (
              'Simpan & Kirim Konfirmasi'
            )}
          </Button>
        </form>
      </PageShell>
    </>
  )
}

export default Akun
