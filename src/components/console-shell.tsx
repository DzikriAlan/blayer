'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

import logo from '@/shared/images/logoblayer.png'
import { cn } from '@/shared/lib/utils'

interface Props {
  className?: string
  backHref?: string
  backLabel?: string
  children: React.ReactNode
}

export default function ConsoleShell({
  className,
  backHref,
  backLabel,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3 px-3 py-3 sm:px-5">
          <Link href="/console" className="flex items-center gap-2.5">
            <Image src={logo} alt="Blayer" priority className="h-8 w-auto shrink-0" />
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Console
            </span>
          </Link>

          {backHref ? (
            <Link
              href={backHref}
              className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel ?? 'Kembali'}
            </Link>
          ) : null}
        </div>
      </header>

      <main className={cn('flex-1', className)}>{children}</main>
    </div>
  )
}
