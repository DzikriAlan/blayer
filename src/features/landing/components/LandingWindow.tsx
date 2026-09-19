import type { ReactNode } from 'react'
import { useInView } from '@/shared/hooks/useInView'
import type { RevealVariant } from './LandingDecor'

/* macOS traffic-light colours, hard-coded on purpose.

   These are a literal quotation of another OS's chrome, not Blayer's palette —
   putting them on theme tokens would let a palette change silently repaint
   them, and a lilac "close" button stops reading as a close button. They are
   decorative: the row is aria-hidden and none of them is a real control. */
const LIGHTS = [
  { key: 'close', color: '#FF5F57' },
  { key: 'minimise', color: '#FEBC2E' },
  { key: 'zoom', color: '#28C840' },
]

interface TrafficLightsProps {
  className?: string
}

export function TrafficLights({ className = '' }: Readonly<TrafficLightsProps>) {
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center gap-1.5 ${className}`}>
      {LIGHTS.map((light) => (
        <span
          key={light.key}
          className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/10 transition-transform duration-200 group-hover/window:scale-110"
          style={{ backgroundColor: light.color }}
        />
      ))}
    </span>
  )
}

interface WindowCardProps {
  /** Shown centred in the title bar, the way a Mac window titles itself. */
  title: string
  /** Optional right-hand chrome — a status pill, a tab, a count. */
  trailing?: ReactNode
  children: ReactNode
  className?: string
  /** Padding around the body. Pass `false` when the body brings its own. */
  padded?: boolean
  delayMs?: number
  /** Entrance direction, so neighbouring windows do not all arrive the same way. */
  variant?: RevealVariant
}

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: 'animate-fade-up',
  left: 'animate-slide-in-left',
  right: 'animate-slide-in-right',
  clip: 'animate-clip-up',
  unroll: 'animate-unroll',
  fade: 'animate-fade-in',
}

/**
 * A card dressed as a desktop window: traffic lights, a centred title, and a
 * hairline under the bar.
 *
 * The title is centred with absolute positioning rather than `justify-between`
 * so it stays optically centred in the card no matter how wide the lights or
 * the trailing slot are — and it is allowed to truncate before it can collide
 * with either side.
 */
export default function WindowCard({
  title, trailing, children, className = '', padded = true, delayMs = 0, variant = 'up',
}: Readonly<WindowCardProps>) {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      data-reveal={inView ? 'shown' : 'pending'}
      className={`group/window relative overflow-hidden rounded-2xl border border-border bg-card ${
        inView ? VARIANT_CLASS[variant] : ''
      } ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="relative flex h-10 shrink-0 items-center gap-2 border-b border-border bg-muted/40 px-3 sm:px-4">
        <TrafficLights />

        <span className="pointer-events-none absolute inset-x-0 flex justify-center px-20">
          <span className="truncate text-rem-75 font-medium text-muted-foreground">{title}</span>
        </span>

        {trailing && <span className="ml-auto flex shrink-0 items-center">{trailing}</span>}
      </div>

      <div className={padded ? 'p-4 sm:p-5' : undefined}>{children}</div>
    </div>
  )
}
