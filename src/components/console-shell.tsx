'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, LayoutGrid, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useConsoleControllers } from '@/features/console/controllers/consoleControllers'
import { useConsoleStates } from '@/features/console/states/consoleStates'
import logo from '@/shared/images/logoblayer.png'
import { cn } from '@/shared/lib/utils'

export interface ConsoleCrumb {
  label: string
  href?: string
  badge?: string
}

interface Props {
  className?: string
  // Jejak tempat, bukan tombol kembali: yang di atas selalu menyebutkan di mana
  // halaman ini berada, bukan ke mana tombolnya mengantar.
  breadcrumb?: ConsoleCrumb[]
  // Panel menu di samping. Halaman yang tidak punya menu tidak memakainya.
  sidebarTitle?: string
  sidebar?: React.ReactNode
  children: React.ReactNode
}

export default function ConsoleShell({
  className,
  breadcrumb = [],
  sidebarTitle,
  sidebar,
  children,
}: Props) {
  const { token, username } = useConsoleStates()
  const { removeConsoleSession } = useConsoleControllers()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="flex h-12 w-full items-center gap-2 px-3 sm:px-4">
          <Link href="/console" className="flex shrink-0 items-center gap-2">
            <Image src={logo} alt="Blayer" priority className="h-6 w-auto" />
          </Link>

          <nav aria-label="Jejak halaman" className="flex min-w-0 items-center gap-2">
            {breadcrumb.map((crumb) => (
              <span key={crumb.label} className="flex min-w-0 items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />

                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="truncate text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate text-sm">{crumb.label}</span>
                )}

                {crumb.badge ? (
                  <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {crumb.badge}
                  </span>
                ) : null}
              </span>
            ))}
          </nav>

          {token ? (
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {username || 'operator'}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeConsoleSession}
              >
                <LogOut className="h-3.5 w-3.5" />
                Keluar
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="flex flex-1 items-stretch">
        {token ? (
          <nav
            aria-label="Pindah bagian"
            className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-border py-3 lg:flex"
          >
            <Link
              href="/console"
              aria-label="Semua project"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <LayoutGrid className="h-4 w-4" />
            </Link>
          </nav>
        ) : null}

        {sidebar ? (
          <aside className="hidden w-60 shrink-0 flex-col border-r border-border lg:flex">
            {sidebarTitle ? (
              <p className="border-b border-border px-4 py-3.5 text-sm font-medium">
                {sidebarTitle}
              </p>
            ) : null}

            <div className="flex-1 overflow-y-auto p-2">{sidebar}</div>
          </aside>
        ) : null}

        <main className={cn('min-w-0 flex-1', className)}>
          {sidebar ? (
            <div className="border-b border-border p-3 lg:hidden">{sidebar}</div>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  )
}
