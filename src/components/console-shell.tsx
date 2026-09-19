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
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-paper">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-2 sm:px-8">
          <Link href="/console" className="flex items-center gap-3">
            <Image src={logo} alt="Blayer" priority className="h-10 w-auto shrink-0" />
            <span className="brutal-eyebrow border-2 border-foreground px-2 py-1">
              CONSOLE
            </span>
          </Link>

          {backHref ? (
            <Link
              href={backHref}
              className="brutal-eyebrow ml-auto inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel ?? 'KEMBALI'}
            </Link>
          ) : null}
        </div>
      </header>

      <main className={cn('flex-1', className)}>{children}</main>
    </div>
  )
}
