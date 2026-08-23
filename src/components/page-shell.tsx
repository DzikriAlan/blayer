'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowDown } from 'lucide-react'

import mark from '@/shared/images/emotblayer.png'
import { cn } from '@/shared/lib/utils'
import BackLink from '@/components/back-link'
import AuthAccount from '@/features/auth/components/authAccount'

interface Props {
  backHref?: string
  railWord?: string
  railEyebrow?: string
  railIndex?: string
  barTitle: string
  railNote?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export default function PageShell({
  backHref = '/',
  railWord = 'BLAYER',
  railEyebrow = 'BRUTAL\nFORM.',
  railIndex = '01',
  barTitle,
  railNote = 'SCORING',
  action,
  className,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-[210px] shrink-0 flex-col justify-between overflow-hidden border-r-2 border-foreground bg-primary px-6 py-5 xl:flex">
        <div className="flex items-start justify-between gap-3">
          <Link
            href="/"
            className="brutal-eyebrow whitespace-pre-line leading-tight text-foreground"
          >
            {railEyebrow}
          </Link>
          <span className="brutal-index bg-foreground text-primary">
            {railIndex}
          </span>
        </div>

        <span
          aria-hidden
          className="brutal-vertical rotate-180 self-start font-display text-[9rem] font-black leading-[0.78] tracking-tighter text-foreground"
        >
          {railWord}
        </span>

        <div className="flex flex-col gap-4">
          <p className="brutal-eyebrow leading-relaxed text-foreground">
            NO FRILLS.
            <br />
            JUST ANSWERS.
            <br />
            PURE INPUT.
          </p>
          <div aria-hidden className="brutal-dots h-20 w-28 opacity-90" />
          <p className="brutal-eyebrow leading-tight text-foreground">
            BLAYER®
            <br />
            STUDIO
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-4 border-b-2 border-foreground bg-foreground px-4 py-3.5 text-background sm:px-6">
          <BackLink
            href={backHref}
            className="border-background hover:bg-background hover:text-foreground"
          />

          <Link
            href="/"
            aria-label="Kembali ke halaman depan"
            className="flex h-10 w-10 shrink-0 items-center justify-center"
          >
            <Image
              src={mark}
              alt=""
              width={40}
              height={40}
              priority
              className="h-10 w-10 border-2 border-background"
            />
          </Link>
          <p className="brutal-eyebrow truncate text-background">{barTitle}</p>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {action}
            <AuthAccount tone="dark" />
          </div>
        </header>

        <main className={cn('flex-1 px-4 py-8 sm:px-8 sm:py-10', className)}>
          <div className="mx-auto w-full max-w-3xl">{children}</div>
        </main>
      </div>

      <aside
        aria-hidden
        className="sticky top-0 hidden h-screen w-12 shrink-0 flex-col border-l-2 border-foreground lg:flex"
      >
        <div className="flex flex-1 items-start justify-center bg-paper pt-6">
          <span className="brutal-vertical rotate-180 text-primary">
            <span className="brutal-eyebrow text-foreground">*&nbsp;{railNote}</span>
          </span>
        </div>
        <div className="h-40 bg-foreground" />
        <div className="flex flex-1 flex-col items-center justify-end gap-4 bg-primary pb-6">
          <span className="brutal-vertical rotate-180 brutal-eyebrow text-foreground">
            SCROLL
          </span>
          <ArrowDown className="h-5 w-5 text-foreground" />
        </div>
      </aside>
    </div>
  )
}
