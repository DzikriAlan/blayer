import type { CSSProperties, ReactNode } from 'react'
import { useInView } from '@/shared/hooks/useInView'
import { Reveal, type RevealVariant } from './LandingDecor'

interface SectionHeadProps {
  /** Zero-padded step number. Gives the page a spine you can navigate by. */
  index?: string
  kicker?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  variant?: RevealVariant
}

/**
 * Section heading.
 *
 * Deliberately supports left alignment and an index, because five identically
 * centred headings down a page is the single loudest "templated" signal.
 */
export function SectionHead({
  index, kicker, title, subtitle, align = 'left', variant = 'up',
}: Readonly<SectionHeadProps>) {
  const centered = align === 'center'

  return (
    <Reveal variant={variant} className={`mb-8 md:mb-10 ${centered ? 'text-center' : ''}`}>
      {(index || kicker) && (
        <p className={`mb-3 flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
          {index && (
            <span className="font-mono text-rem-70 font-medium tabular-nums text-iris">{index}</span>
          )}
          {index && <span aria-hidden="true" className="h-px w-8 bg-border" />}
          {kicker && (
            <span className="text-rem-70 font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {kicker}
            </span>
          )}
        </p>
      )}

      <h2 className="max-w-2xl font-gudlak text-rem-160 font-bold leading-tight tracking-tight text-foreground sm:text-[2rem] md:text-[2.4rem]">
        {title}
      </h2>

      {subtitle && (
        <p className={`mt-3 max-w-xl text-rem-90 leading-relaxed text-muted-foreground ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}

interface CardProps {
  className?: string
  style?: CSSProperties
  delayMs?: number
  variant?: RevealVariant
  children: ReactNode
}

export function BentoCard({
  className = '', style, delayMs = 0, variant = 'up', children,
}: Readonly<CardProps>) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const animation = {
    up: 'animate-fade-up',
    left: 'animate-slide-in-left',
    right: 'animate-slide-in-right',
    clip: 'animate-clip-up',
    unroll: 'animate-unroll',
    fade: 'animate-fade-in',
  }[variant]

  return (
    <div
      ref={ref}
      data-reveal={inView ? 'shown' : 'pending'}
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-5 ${
        inView ? animation : ''
      } ${className}`}
      style={{ animationDelay: `${delayMs}ms`, ...style }}
    >
      {children}
    </div>
  )
}

interface SourceProps {
  children: ReactNode
}

/** Every number on this page carries one of these. No unsourced statistics. */
export function SourceNote({ children }: Readonly<SourceProps>) {
  return (
    <p className="mt-3 border-t border-border pt-2.5 text-rem-65 leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}
