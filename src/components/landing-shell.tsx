'use client'

import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import logo from '@/shared/images/logoblayer.png'
import { cn } from '@/shared/lib/utils'

const FOOTER_COLUMNS = [
  {
    title: 'Halaman',
    links: [
      { href: '/', label: 'Beranda' },
      { href: '/#cara-kerja', label: 'Cara Kerja' },
      { href: '/#fitur', label: 'Fitur' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { href: '/console', label: 'Console' },
      { href: '/api/health', label: 'Status Layanan' },
    ],
  },
]

interface Props {
  className?: string
  children: React.ReactNode
}

export default function LandingShell({ className, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src={logo} alt="Blayer" priority className="h-8 w-auto shrink-0" />
          </Link>

          <nav className="ml-6 hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <Link href="/#cara-kerja" className="transition-colors hover:text-foreground">
              Cara Kerja
            </Link>
            <Link href="/#fitur" className="transition-colors hover:text-foreground">
              Fitur
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/console">Masuk Console</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className={cn('flex-1', className)}>{children}</main>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
          <div>
            <Image src={logo} alt="Blayer" className="h-8 w-auto" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Blayer mengatur AI, project menguasai data. Self-hosted, berlisensi
              MIT.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-medium text-foreground">{column.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-5 py-5 sm:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Blayer
            </p>
            <p className="text-xs text-muted-foreground">
              AI Agent Platform yang jalan di infrastrukturmu sendiri
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
