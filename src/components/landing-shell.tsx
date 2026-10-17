'use client'

import Link from 'next/link'

import { LandingLocaleProvider } from '@/features/landing/components/landingLocaleContext'
import LandingLocaleToggle from '@/features/landing/components/landingLocaleToggle'
import LandingGithubButton from '@/features/landing/components/landingGithubButton'
import { cn } from '@/shared/lib/utils'

interface Props {
  className?: string
  children: React.ReactNode
}

export default function LandingShell({ className, children }: Props) {
  return (
    <LandingLocaleProvider>
      <div className="flex min-h-screen flex-col bg-white text-neutral-900">
        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-4 sm:px-8">
            <Link
              href="/"
              className="text-lg font-extrabold uppercase tracking-[0.2em] text-neutral-900"
            >
              Blayer
            </Link>

            <div className="ml-auto flex items-center gap-3">
              <LandingLocaleToggle />
              <LandingGithubButton />
            </div>
          </div>
        </header>

        <main className={cn('flex-1', className)}>{children}</main>
      </div>
    </LandingLocaleProvider>
  )
}
