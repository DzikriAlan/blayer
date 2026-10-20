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
    <div className="relative mx-auto w-full max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(70%_70%_at_50%_50%,hsl(var(--primary)/0.18),transparent_70%)]"
      />

      <div className="flex flex-col items-center text-center">
        <span className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          ERROR {code}
        </span>

        <h1 className="mt-6 whitespace-pre-line text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {title}
        </h1>

        <p className="mt-5 max-w-lg text-pretty leading-relaxed text-muted-foreground">
          {subtitle}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/">
              <Home /> Kembali ke Beranda
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/#produk">
              <LayoutGrid /> Lihat Produk
            </Link>
          </Button>
          {children}
        </div>
      </div>

      <ul className="mt-14 grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                {link.label}
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {link.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
