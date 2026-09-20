'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Code2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  LANDING_FOOTER,
  LANDING_NAV,
  REPO_URL,
} from '@/features/landing/components/landingCatalog'
import logo from '@/shared/images/logoblayer.png'
import { cn } from '@/shared/lib/utils'

interface Props {
  className?: string
  children: React.ReactNode
}

export default function LandingShell({ className, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Link
        href={`${REPO_URL}/blob/main/README.md`}
        className="group block border-b border-border bg-card/60 px-5 py-2 text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Blayer masih muda: bagian inti sudah jalan, sisanya ditulis apa adanya di
        halaman ini{' '}
        <span className="inline-flex items-center gap-1 text-primary">
          Baca catatannya
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>

      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src={logo} alt="Blayer" priority className="h-8 w-auto shrink-0" />
          </Link>

          <nav className="ml-6 hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
            {LANDING_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={REPO_URL}
              aria-label="Repositori Blayer di GitHub"
              className="hidden items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <Code2 className="h-4 w-4" />
              GitHub
            </Link>

            <Button asChild size="sm">
              <Link href="/console">Masuk Console</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className={cn('flex-1', className)}>{children}</main>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
          <div>
            <Image src={logo} alt="Blayer" className="h-8 w-auto" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Blayer mengatur AI, project menguasai data. Self-hosted, berlisensi
              MIT.
            </p>

            <Link
              href={REPO_URL}
              className="mt-6 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Code2 className="h-4 w-4" />
              Lihat kodenya
            </Link>
          </div>

          {LANDING_FOOTER.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-medium text-foreground">{column.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}`}>
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
              © {new Date().getFullYear()} Blayer · MIT
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
