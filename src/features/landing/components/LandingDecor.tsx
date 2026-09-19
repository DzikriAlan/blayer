import type { ReactNode } from 'react'
import { useInView } from '@/shared/hooks/useInView'

/* Decorative primitives for the marketing page.

   Every one of them is a colour wash with a `currentColor` dot grid painted on
   top and masked with a gradient — the dots thin out toward the mask's
   transparent end, which is what produces the retro dither. The dot layer is
   always tinted to the surface it sits on (`text-background`, `text-card`), so
   it reads as holes punched through the wash rather than as added specks. */

/** Entrance variants. Each section picks one so the page has a rhythm rather
    than one fade-up repeated top to bottom. */
export type RevealVariant = 'up' | 'left' | 'right' | 'clip' | 'unroll' | 'fade'

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: 'animate-fade-up',
  left: 'animate-slide-in-left',
  right: 'animate-slide-in-right',
  clip: 'animate-clip-up',
  unroll: 'animate-unroll',
  fade: 'animate-fade-in',
}

interface RevealProps {
  children: ReactNode
  /** Stagger within a group, in milliseconds. */
  delayMs?: number
  variant?: RevealVariant
  className?: string
}

/**
 * Fades its children up the first time they scroll into view.
 *
 * The hidden state is `opacity-0` rather than `display:none`, so the element
 * still occupies its space and nothing reflows when it appears. If
 * IntersectionObserver is unavailable the hook reports "in view" immediately,
 * so the content can never get stuck invisible.
 */
export function Reveal({
  children, delayMs = 0, variant = 'up', className = '',
}: Readonly<RevealProps>) {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      data-reveal={inView ? 'shown' : 'pending'}
      className={`${inView ? VARIANT_CLASS[variant] : ''} ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  )
}

interface OrbProps {
  className?: string
}

/** Big halftone sun — hero backdrop. */
export function HalftoneOrb({ className = '' }: Readonly<OrbProps>) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage:
            'radial-gradient(circle at 32% 28%, #E9D5FF 0%, #C084FC 18%, #9333EA 42%, #4C1D95 62%, transparent 73%)',
        }}
      />
      <div className="absolute inset-0 rounded-full halftone mask-orb text-background" />
    </div>
  )
}

interface WashProps {
  /** Which surface the dots should be tinted to, so they read as holes. */
  surface?: 'background' | 'card'
  /** Direction the dither thins out in. */
  fade?: 'down' | 'up' | 'radial'
  grid?: 'fine' | 'default' | 'coarse'
  className?: string
}

const gridClass = { fine: 'halftone-fine', default: '', coarse: 'halftone-coarse' }
const fadeClass = { down: 'mask-down', up: 'mask-up', radial: 'mask-radial' }

/** Corner-lit orange wash with a dithered falloff — the bento-card backdrop. */
export function HalftoneWash({
  surface = 'card',
  fade = 'down',
  grid = 'default',
  className = '',
}: Readonly<WashProps>) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(120% 130% at 12% 0%, #C084FC 0%, #9333EA 34%, #4C1D95 62%, transparent 82%)',
        }}
      />
      <div
        className={`absolute inset-0 halftone ${gridClass[grid]} ${fadeClass[fade]} ${
          surface === 'card' ? 'text-card' : 'text-background'
        }`}
      />
    </div>
  )
}

/** 48px rule grid, faded out at the edges — the page's base texture. */
export function GridBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
    </>
  )
}

/** Film grain laid over the whole page. */
export function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'repeat',
      }}
    />
  )
}
