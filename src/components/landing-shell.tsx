'use client'

import Link from 'next/link'
import Image from 'next/image'

import logo from '@/shared/images/logoblayer.png'
import wordmark from '@/shared/images/blayer.png'
import { cn } from '@/shared/lib/utils'
import AuthAccount from '@/features/auth/components/authAccount'

const FOOTER_COLUMNS = [
  {
    title: 'HALAMAN',
    links: [
      { href: '/', label: 'Beranda' },
      { href: '/forms', label: 'Semua Form' },
      { href: '/privacy', label: 'Privasi' },
    ],
  },
  {
    title: 'AKUN',
    links: [
      { href: '/login', label: 'Masuk' },
      { href: '/register', label: 'Daftar' },
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
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-paper">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-5 py-2 sm:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt="Blayer"
              priority
              className="h-14 w-auto shrink-0"
            />
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <AuthAccount />
          </div>
        </div>
      </header>

      <main className={cn('flex-1', className)}>{children}</main>

      <footer className="border-t-2 border-foreground bg-foreground text-background">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-12 sm:grid-cols-3 sm:px-8">
          <div>
            <Image
              src={wordmark}
              alt="Blayer"
              width={360}
              height={360}
              className="h-auto w-[180px] border-2 border-background"
            />
            <p className="brutal-eyebrow mt-5 leading-relaxed opacity-70">
              TAKE WHAT YOU NEED.
              <br />
              BUILD WHAT YOU NEED.
              <br />
              MAKE WHAT YOU NEED.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="brutal-eyebrow opacity-70">{column.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-[32px] items-center font-mono text-sm hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-background/20 px-5 py-5 sm:px-8">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p className="brutal-eyebrow opacity-60">
              © {new Date().getFullYear()} BLAYER® STUDIO
            </p>
            <p className="brutal-eyebrow opacity-60">
              DIBUAT UNTUK FORM YANG HASILNYA LANGSUNG TERBACA
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
