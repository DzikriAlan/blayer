'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, Plus, X } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/components/ui/button'
import AuthAccount from '@/features/auth/components/authAccount'

const NAV_ITEMS = [{ href: '#kategori', label: 'Kategori' }]

interface Props {
  className?: string
  children: React.ReactNode
}

export default function LandingShell({ className, children }: Props) {
  const [filters, setFilters] = useState({ isMenuOpen: false })

  const editMenu = () => {
    setFilters((prev) => ({ ...prev, isMenuOpen: !prev.isMenuOpen }))
  }

  const clearMenu = () => {
    setFilters((prev) => ({ ...prev, isMenuOpen: false }))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-paper">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-3.5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={clearMenu}
          >
            <Image
              src="/blayer-mark.png"
              alt=""
              width={36}
              height={36}
              priority
              className="h-9 w-9 shrink-0 border-2 border-foreground"
            />
            <span className="font-display text-xl font-black uppercase leading-none tracking-tight">
              Blayer<span className="text-primary">®</span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-7 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="brutal-eyebrow flex min-h-[32px] items-center text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-3 sm:flex">
            <Button asChild variant="outline" size="sm">
              <Link href="/forms">Semua Form</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/forms/create">
                <Plus /> Buat Form
              </Link>
            </Button>
            <AuthAccount />
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="ml-auto sm:hidden"
            aria-label={filters.isMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={filters.isMenuOpen}
            onClick={editMenu}
          >
            {filters.isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {filters.isMenuOpen ? (
          <div className="border-t-2 border-foreground bg-muted px-5 py-5 sm:hidden">
            <nav className="flex flex-col gap-4">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="brutal-eyebrow flex min-h-[32px] items-center"
                  onClick={clearMenu}
                >
                  <span className="text-primary">{'> '}</span>
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm" onClick={clearMenu}>
                <Link href="/forms">Semua Form</Link>
              </Button>
              <Button asChild size="sm" onClick={clearMenu}>
                <Link href="/forms/create">
                  <Plus /> Buat Form
                </Link>
              </Button>
              <AuthAccount />
            </div>
          </div>
        ) : null}
      </header>

      <main className={cn('flex-1', className)}>{children}</main>

      <footer className="border-t-2 border-foreground bg-foreground text-background">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3 sm:px-8">
          <div>
            <Image
              src="/blayer-logo.png"
              alt="Blayer"
              width={200}
              height={92}
              className="h-auto w-[180px] border-2 border-background"
            />
            <p className="brutal-eyebrow mt-5 leading-relaxed opacity-70">
              NO FRILLS.
              <br />
              JUST ANSWERS.
              <br />
              PURE INPUT.
            </p>
          </div>

          <div>
            <p className="brutal-eyebrow opacity-70">HALAMAN</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex min-h-[32px] items-center font-mono text-sm hover:text-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/forms"
                  className="inline-flex min-h-[32px] items-center font-mono text-sm hover:text-primary"
                >
                  Semua Form
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="brutal-eyebrow opacity-70">MULAI</p>
            <p className="mt-4 font-mono text-sm leading-relaxed opacity-80">
              Mulai dari satu template, sesuaikan pertanyaannya, lalu bagikan
              tautannya.
            </p>
            <Button asChild variant="paper" size="sm" className="mt-5">
              <Link href="/forms/create">
                <Plus /> Buat Form
              </Link>
            </Button>
          </div>
        </div>

        <div className="border-t-2 border-background/20 px-5 py-5 sm:px-8">
          <p className="brutal-eyebrow mx-auto w-full max-w-6xl opacity-60">
            BLAYER® STUDIO · DIBUAT UNTUK FORM YANG HASILNYA LANGSUNG TERBACA
          </p>
        </div>
      </footer>
    </div>
  )
}
