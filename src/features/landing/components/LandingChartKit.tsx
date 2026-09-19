import { useId, useState } from 'react'
import type { ReactNode } from 'react'

/* Charts here are drawn in a normalised 0–100 box and stretched to fit with
   `preserveAspectRatio="none"`.

   That keeps the plot area exactly flush with the HTML axis labels around it,
   at any width. Two consequences drive the rest of the design:
   - every stroke carries `vector-effect="non-scaling-stroke"`, so a 2px line
     stays 2px instead of thinning to under a pixel on a phone;
   - nothing that must keep its shape — text, circles, rounded bars — goes
     inside the SVG, because the stretch would distort it. Those are HTML,
     positioned in percentages over the plot. This is also why axis labels read
     at their real CSS size on mobile rather than being scaled down with the
     viewBox. */

export const PLOT = { w: 100, h: 100 }
/** Headroom inside the plot so markers and the top of the curve are not clipped. */
export const INSET = { top: 6, bottom: 3 }

export type Point = readonly [number, number]

/** Fraction 0–1 of the plot width for point `i` of `count`. */
export function fractionX(i: number, count: number) {
  return count <= 1 ? 0 : i / (count - 1)
}

/** Fraction 0–1 of the plot width for the centre of slot `i` of `count`. */
export function slotCenterX(i: number, count: number) {
  return count <= 0 ? 0 : (i + 0.5) / count
}

export function plotX(i: number, count: number) {
  return fractionX(i, count) * PLOT.w
}

export function plotY(value: number, min: number, max: number) {
  const usable = PLOT.h - INSET.top - INSET.bottom
  if (max === min) return INSET.top + usable
  return INSET.top + (1 - (value - min) / (max - min)) * usable
}

/**
 * Horizontal-tangent cubic smoothing.
 *
 * Both control points sit at the midpoint x carrying the endpoint y values, so
 * a segment can never bulge past the two values it connects — the curve cannot
 * invent a peak or a dip the data does not contain.
 */
export function smoothPath(points: readonly Point[]) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`

  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const cx = (x0 + x1) / 2
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`
  }
  return d
}

/* ── Chrome ───────────────────────────────────────────────────────────────── */

interface FrameProps {
  title: string
  /** Say where the numbers come from. */
  note?: string
  legend?: ReactNode
  children: ReactNode
  /** Rendered as a screen-reader-only table, so the data is never colour-only. */
  table: { columns: string[]; rows: (string | number)[][] }
  className?: string
}

export function ChartFrame({ title, note, legend, children, table, className = '' }: Readonly<FrameProps>) {
  const tableId = useId()

  return (
    <figure className={`m-0 ${className}`}>
      <figcaption className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
        <span className="min-w-0">
          <span className="block text-rem-90 font-semibold text-foreground">{title}</span>
          {note && <span className="mt-0.5 block text-rem-70 text-muted-foreground">{note}</span>}
        </span>
        {legend}
      </figcaption>

      {children}

      <table id={tableId} className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>{table.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={String(row[0])}>
              {row.map((cell, i) => (
                i === 0
                  ? <th key={`${row[0]}-h`} scope="row">{cell}</th>
                  : <td key={`${row[0]}-${table.columns[i]}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

interface LegendProps {
  items: { label: string; className: string }[]
}

export function Legend({ items }: Readonly<LegendProps>) {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          {/* Identity is mark + text, never the mark alone. */}
          <span className={`h-2 w-2 shrink-0 rounded-full ${item.className}`} />
          <span className="text-rem-70 text-muted-foreground">{item.label}</span>
        </li>
      ))}
    </ul>
  )
}

/* ── Axis furniture (HTML, so it keeps its real font size) ────────────────── */

interface AxisProps {
  /** Tick values top-to-bottom. */
  ticks: readonly string[]
}

export function YAxis({ ticks }: Readonly<AxisProps>) {
  return (
    <div aria-hidden="true" className="absolute inset-y-0 left-0 w-8 sm:w-10">
      {ticks.map((t, i) => (
        <span
          key={t}
          className="absolute right-1.5 -translate-y-1/2 text-rem-65 tabular-nums text-muted-foreground"
          style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
        >
          {t}
        </span>
      ))}
    </div>
  )
}

interface XAxisProps {
  labels: readonly string[]
  /** Line charts anchor on the point; bar charts on the slot centre. */
  anchor?: 'point' | 'slot'
  /** Drop every other label below this breakpoint to stop them colliding. */
  thinOnMobile?: boolean
}

export function XAxis({ labels, anchor = 'point', thinOnMobile = false }: Readonly<XAxisProps>) {
  return (
    <div aria-hidden="true" className="relative mt-1.5 h-4">
      {labels.map((label, i) => {
        const fraction = anchor === 'slot' ? slotCenterX(i, labels.length) : fractionX(i, labels.length)
        const hide = thinOnMobile && i % 2 === 1
        return (
          <span
            key={label}
            className={`absolute -translate-x-1/2 whitespace-nowrap text-rem-65 text-muted-foreground ${
              hide ? 'hidden sm:inline' : ''
            }`}
            style={{ left: `${fraction * 100}%` }}
          >
            {label}
          </span>
        )
      })}
    </div>
  )
}

/* ── Hover layer ──────────────────────────────────────────────────────────── */

interface TooltipProps {
  /** 0–1 position across the plot area. */
  x: number
  children: ReactNode
}

export function ChartTooltip({ x, children }: Readonly<TooltipProps>) {
  // Flip the anchor near the edges so the bubble never clips out of the card.
  let anchor = 'translateX(-50%)'
  if (x > 0.72) anchor = 'translateX(-100%)'
  else if (x < 0.28) anchor = 'translateX(0)'

  return (
    <div
      className="pointer-events-none absolute -top-1 z-10 animate-fade-in"
      style={{ left: `${x * 100}%`, transform: anchor }}
    >
      <div className="min-w-[7rem] whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-rem-70 text-popover-foreground shadow-popup">
        {children}
      </div>
    </div>
  )
}

/**
 * Invisible column hit-targets — wider than the marks, per the interaction spec.
 *
 * One tab stop for the whole plot, then left/right to walk the points. Giving
 * each column its own tab stop would have put ~28 of them on the landing page
 * before a keyboard user reached the footer; this is the composite-widget
 * pattern instead, and the sr-only table still carries the full data.
 */
interface HitAreaProps {
  count: number
  labels: readonly string[]
  index: number | null
  onHover: (index: number | null) => void
}

export function HitColumns({ count, labels, index, onHover }: Readonly<HitAreaProps>) {
  const step = (delta: number) => {
    const next = index === null ? 0 : index + delta
    onHover(Math.max(0, Math.min(count - 1, next)))
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
    else if (e.key === 'Home') { e.preventDefault(); onHover(0) }
    else if (e.key === 'End') { e.preventDefault(); onHover(count - 1) }
    else if (e.key === 'Escape') onHover(null)
  }

  return (
    <div
      role="group"
      tabIndex={0}
      aria-label={index === null
        ? `${count} data points. Use the arrow keys to read them.`
        : `${labels[index]}, point ${index + 1} of ${count}`}
      className="absolute inset-0 flex rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      onKeyDown={onKeyDown}
      onBlur={() => onHover(null)}
      onMouseLeave={() => onHover(null)}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={labels[i] ?? i}
          aria-hidden="true"
          className="h-full flex-1"
          onMouseEnter={() => onHover(i)}
        />
      ))}
    </div>
  )
}

export function useHoverIndex() {
  const [index, setIndex] = useState<number | null>(null)
  return { index, setIndex }
}
