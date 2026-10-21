import Link from 'next/link'

import AutoplayToggle from '@/components/autoplay-toggle'
import ThemeToggle from '@/components/theme-toggle'
import { cn } from '@/shared/lib/utils'

interface Props {
  className?: string
  children: React.ReactNode
  footer?: React.ReactNode
  hideHeader?: boolean
}

export default function AppShell({ className, children, footer, hideHeader }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center overflow-x-hidden bg-background text-foreground">
      {hideHeader ? null : (
        <header className="flex w-full max-w-[1360px] items-center justify-between gap-3 px-[clamp(16px,4vw,48px)] py-4">
          <Link
            href="/"
            aria-label="Blayer, ke beranda"
            className="font-display text-[30px] font-normal leading-none tracking-tight"
          >
            blayer
          </Link>
          <div className="flex items-center gap-1">
            <AutoplayToggle />
            <ThemeToggle />
          </div>
        </header>
      )}
      <main className={cn('flex w-full flex-1 flex-col items-center', className)}>{children}</main>
      {footer}
    </div>
  )
}
