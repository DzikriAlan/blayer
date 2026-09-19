'use client'

import { Component, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[blayer] render gagal', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-7">
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Something broke
          </span>
          <h1 className="mt-5 text-2xl font-semibold leading-tight tracking-tight">
            Halaman ini berhenti.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Ada bagian halaman yang gagal ditampilkan. Muat ulang biasanya cukup;
            kalau berulang, catat langkah terakhirmu saat melapor.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Muat Ulang
          </Button>
        </div>
      </div>
    )
  }
}
