import Link from 'next/link'
import { ArrowRight, Home, LayoutGrid } from 'lucide-react'

import { Button } from '@/components/ui/button'

export interface ErrorViewLink {
  href: string
  label: string
  description: string
}

interface Props {
  code: string
  title: string
  subtitle: string
  links: ErrorViewLink[]
  children?: React.ReactNode
}

export default function ErrorView({
  code,
  title,
  subtitle,
  links,
  children,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="border-2 border-foreground bg-paper">
        <div className="flex items-stretch gap-3 border-b-2 border-foreground bg-foreground px-5 py-3 text-background sm:px-7">
          <span className="brutal-eyebrow">ERROR {code}</span>
          <span aria-hidden className="brutal-hatch flex-1 opacity-40" />
        </div>

        <div className="grid gap-8 px-5 py-12 sm:px-7 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <p
            aria-hidden
            className="font-display text-[clamp(5rem,16vw,11rem)] font-black leading-[0.8] tracking-[-0.05em] text-primary"
          >
            {code}
          </p>

          <div>
            <h1 className="whitespace-pre-line break-words font-display text-[clamp(1.9rem,4.5vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
              {title}
              <span className="text-primary">.</span>
            </h1>
            <p className="mt-5 max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="whitespace-normal text-center">
                <Link href="/">
                  <Home /> Kembali ke Beranda
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="whitespace-normal text-center"
              >
                <Link href="/forms">
                  <LayoutGrid /> Semua Form
                </Link>
              </Button>
              {children}
            </div>
          </div>
        </div>

        <ul className="grid border-t-2 border-foreground sm:grid-cols-3">
          {links.map((link) => (
            <li
              key={link.href}
              className="border-b-2 border-foreground last:border-b-0 sm:border-b-0 sm:border-r-2 sm:last:border-r-0"
            >
              <Link
                href={link.href}
                className="group flex h-full flex-col gap-2 px-5 py-5 transition-colors hover:bg-muted sm:px-7"
              >
                <span className="brutal-eyebrow flex items-center gap-2 text-muted-foreground">
                  {link.label}
                  <ArrowRight className="h-3.5 w-3.5 transition-colors group-hover:text-primary" />
                </span>
                <span className="font-mono text-xs leading-relaxed text-muted-foreground">
                  {link.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
