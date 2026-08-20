'use client'

import Link from 'next/link'
import Image from 'next/image'

import { cn } from '@/shared/lib/utils'
import AuthAccount from '@/features/auth/components/authAccount'

interface Props {
  className?: string
  children: React.ReactNode
}

export default function LandingShell({ className, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-paper">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
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

          <div className="ml-auto flex items-center gap-3">
            <AuthAccount />
          </div>
        </div>
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
