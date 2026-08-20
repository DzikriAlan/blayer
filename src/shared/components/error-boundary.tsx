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
        <div className="w-full max-w-md border-2 border-foreground bg-paper">
          <div className="bg-primary px-6 py-8 text-primary-foreground">
            <p className="brutal-eyebrow">SOMETHING BROKE</p>
            <h1 className="mt-3 font-display text-4xl font-black uppercase leading-none">
              Halaman ini
              <br />
              berhenti
              <span className="text-foreground">.</span>
            </h1>
          </div>
          <div className="px-6 py-7">
            <p className="font-mono text-sm leading-relaxed text-muted-foreground">
              Ada bagian halaman yang gagal ditampilkan. Muat ulang biasanya
              cukup; kalau berulang, catat langkah terakhirmu saat melapor.
            </p>
            <Button
              className="mt-6"
              onClick={() => window.location.reload()}
            >
              Muat Ulang
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
