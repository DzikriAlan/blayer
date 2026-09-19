import type { CSSProperties } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useInView } from '@/shared/hooks/useInView'
import { useCountUp } from '@/shared/hooks/useCountUp'
import {
  ChartFrame, Legend, ChartTooltip, HitColumns, YAxis, XAxis, useHoverIndex,
  PLOT, plotX, plotY, fractionX, slotCenterX, smoothPath,
  type Point,
} from './LandingChartKit'

/* Every figure on this page is illustrative sample data, labelled as such on
   each frame. Blayer ships no telemetry of its own to quote. */

const nf = new Intl.NumberFormat('en-US')

/** `pathLength` normalises the geometry to 100 units, so one dash value draws
    any path regardless of its real length. */
const DRAW: CSSProperties = {
  strokeDasharray: 100,
  '--draw-length': 100,
} as CSSProperties

/* ── Sparkline ────────────────────────────────────────────────────────────── */

interface SparkProps {
  values: readonly number[]
  active: boolean
  className?: string
  delayMs?: number
}

function Sparkline({ values, active, className = 'text-series-1', delayMs = 0 }: Readonly<SparkProps>) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pts: Point[] = values.map((v, i) => [plotX(i, values.length), plotY(v, min, max)])

  return (
    <svg
      viewBox={`0 0 ${PLOT.w} ${PLOT.h}`}
      preserveAspectRatio="none"
      className={`h-7 w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={smoothPath(pts)}
        pathLength={100}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={active ? 'animate-draw-line' : undefined}
        style={{ ...DRAW, strokeDashoffset: active ? undefined : 100, animationDelay: `${delayMs}ms` }}
      />
    </svg>
  )
}

/* ── Stat tile ────────────────────────────────────────────────────────────── */

export interface StatSpec {
  label: string
  value: number
  suffix?: string
  decimals?: number
  deltaLabel: string
  /** Down is good for latency — this drives the icon, not the colour. */
  direction: 'up' | 'down'
  spark: readonly number[]
  seriesClass: string
}

interface StatTileProps {
  stat: StatSpec
  active: boolean
  delayMs?: number
}

export function StatTile({ stat, active, delayMs = 0 }: Readonly<StatTileProps>) {
  const counted = useCountUp(stat.value, active, 1100)
  const shown = active ? counted : 0
  const Icon = stat.direction === 'up' ? TrendingUp : TrendingDown

  return (
    <div
      data-reveal={active ? 'shown' : 'pending'}
      className={`rounded-xl border border-border bg-background p-2.5 sm:p-3 ${active ? 'animate-fade-up' : ''}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <p className="truncate text-rem-65 text-muted-foreground sm:text-rem-70">{stat.label}</p>
      <p className="mt-1 font-gudlak text-rem-130 font-bold leading-none tabular-nums text-foreground sm:text-rem-160">
        {stat.decimals ? shown.toFixed(stat.decimals) : nf.format(Math.round(shown))}
        {stat.suffix && <span className="text-rem-90 font-semibold text-muted-foreground sm:text-rem-100">{stat.suffix}</span>}
      </p>
      <p className="mt-1.5 flex items-center gap-1 text-rem-65 font-medium text-iris sm:text-rem-70">
        <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="truncate">{stat.deltaLabel}</span>
      </p>
      <div className="mt-2">
        <Sparkline values={stat.spark} active={active} className={stat.seriesClass} delayMs={delayMs + 150} />
      </div>
    </div>
  )
}

/* ── Single-series trend (emphasis form) ──────────────────────────────────── */

interface TrendProps {
  title: string
  note?: string
  labels: readonly string[]
  values: readonly number[]
  unit?: string
  /** Tailwind height classes for the plot box. */
  heightClass?: string
}

export function TrendArea({
  title, note, labels, values, unit = '', heightClass = 'h-36 sm:h-44',
}: Readonly<TrendProps>) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const { index, setIndex } = useHoverIndex()

  const max = Math.max(...values) * 1.08
  const min = 0
  const pts: Point[] = values.map((v, i) => [plotX(i, values.length), plotY(v, min, max)])
  const line = smoothPath(pts)
  const area = `${line} L ${PLOT.w} ${PLOT.h} L 0 ${PLOT.h} Z`
  const ticks = [max, (max + min) / 2, min].map((t) => nf.format(Math.round(t)))

  return (
    <ChartFrame
      title={title}
      note={note}
      table={{ columns: ['Week', title], rows: labels.map((l, i) => [l, values[i]]) }}
    >
      <div ref={ref} className="relative pl-8 sm:pl-10">
        <YAxis ticks={ticks} />

        <div className={`relative ${heightClass}`}>
          <svg
            viewBox={`0 0 ${PLOT.w} ${PLOT.h}`}
            preserveAspectRatio="none"
            className="h-full w-full"
            role="img"
            aria-label={`${title}. ${labels[0]} ${values[0]}${unit} rising to ${labels[labels.length - 1]} ${values[values.length - 1]}${unit}.`}
          >
            <defs>
              <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--series-1))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--series-1))" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 0.5, 1].map((t) => (
              <line
                key={t}
                x1={0} x2={PLOT.w}
                y1={t * PLOT.h} y2={t * PLOT.h}
                stroke="hsl(var(--border))"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <path
              d={area}
              fill="url(#trend-fill)"
              data-reveal={inView ? 'shown' : 'pending'}
              className={inView ? 'animate-fade-in' : ''}
              style={{ animationDelay: '600ms' }}
            />
            <path
              d={line}
              pathLength={100}
              fill="none"
              stroke="hsl(var(--series-1))"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className={inView ? 'animate-draw-line' : undefined}
              style={{ ...DRAW, strokeDashoffset: inView ? undefined : 100 }}
            />

            {index !== null && (
              <line
                x1={pts[index][0]} x2={pts[index][0]} y1={0} y2={PLOT.h}
                stroke="hsl(var(--series-1))" strokeWidth={1} strokeDasharray="3 3"
                opacity={0.6} vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Markers are HTML so the stretch cannot turn a circle into an ellipse */}
          <span
            data-reveal={inView ? 'shown' : 'pending'}
            className={`pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-viz-surface bg-series-1 ${
              inView ? 'animate-scale-in' : ''
            }`}
            style={{
              left: `${fractionX(values.length - 1, values.length) * 100}%`,
              top: `${(pts[pts.length - 1][1] / PLOT.h) * 100}%`,
              animationDelay: '1200ms',
            }}
          />
          {index !== null && (
            <span
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-viz-surface bg-series-1"
              style={{
                left: `${fractionX(index, values.length) * 100}%`,
                top: `${(pts[index][1] / PLOT.h) * 100}%`,
              }}
            />
          )}

          <HitColumns count={values.length} labels={labels} index={index} onHover={setIndex} />
          {index !== null && (
            <ChartTooltip x={fractionX(index, values.length)}>
              <span className="font-semibold text-foreground">{nf.format(values[index])}{unit}</span>
              <span className="ml-1.5 text-muted-foreground">{labels[index]}</span>
            </ChartTooltip>
          )}
        </div>

        <XAxis labels={labels} thinOnMobile />
      </div>
    </ChartFrame>
  )
}

/* ── Multi-series lines (categorical) ─────────────────────────────────────── */

export interface SeriesSpec {
  label: string
  values: readonly number[]
  stroke: string
  dotClass: string
}

interface LinesProps {
  title: string
  note?: string
  labels: readonly string[]
  series: readonly SeriesSpec[]
}

export function SeriesLines({ title, note, labels, series }: Readonly<LinesProps>) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const { index, setIndex } = useHoverIndex()

  const max = Math.max(...series.flatMap((s) => s.values)) * 1.1
  const min = 0
  const built = series.map((s) => {
    const pts: Point[] = s.values.map((v, i) => [plotX(i, labels.length), plotY(v, min, max)])
    return { ...s, pts, d: smoothPath(pts) }
  })
  const ticks = [max, (max + min) / 2, min].map((t) => nf.format(Math.round(t)))

  return (
    <ChartFrame
      title={title}
      note={note}
      legend={<Legend items={series.map((s) => ({ label: s.label, className: s.dotClass }))} />}
      table={{
        columns: ['Month', ...series.map((s) => s.label)],
        rows: labels.map((l, i) => [l, ...series.map((s) => s.values[i])]),
      }}
    >
      <div ref={ref} className="relative pl-8 sm:pl-10">
        <YAxis ticks={ticks} />

        <div className="relative h-40 sm:h-52">
          <svg
            viewBox={`0 0 ${PLOT.w} ${PLOT.h}`}
            preserveAspectRatio="none"
            className="h-full w-full"
            role="img"
            aria-label={`${title}: ${series.length} series over ${labels.length} months. Values in the adjacent table.`}
          >
            {[0, 0.5, 1].map((t) => (
              <line
                key={t} x1={0} x2={PLOT.w} y1={t * PLOT.h} y2={t * PLOT.h}
                stroke="hsl(var(--border))" strokeWidth={1} vectorEffect="non-scaling-stroke"
              />
            ))}

            {built.map((s, si) => (
              <path
                key={s.label}
                d={s.d}
                pathLength={100}
                fill="none"
                stroke={s.stroke}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className={inView ? 'animate-draw-line' : undefined}
                style={{ ...DRAW, strokeDashoffset: inView ? undefined : 100, animationDelay: `${si * 180}ms` }}
              />
            ))}

            {index !== null && (
              <line
                x1={plotX(index, labels.length)} x2={plotX(index, labels.length)}
                y1={0} y2={PLOT.h}
                stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="3 3"
                opacity={0.5} vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {index !== null && built.map((s) => (
            <span
              key={`${s.label}-dot`}
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-viz-surface"
              style={{
                left: `${fractionX(index, labels.length) * 100}%`,
                top: `${(s.pts[index][1] / PLOT.h) * 100}%`,
                backgroundColor: s.stroke,
              }}
            />
          ))}

          <HitColumns count={labels.length} labels={labels} index={index} onHover={setIndex} />
          {index !== null && (
            <ChartTooltip x={fractionX(index, labels.length)}>
              <span className="mb-1 block font-semibold text-foreground">{labels[index]}</span>
              {series.map((s) => (
                <span key={s.label} className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dotClass}`} />
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="ml-auto pl-3 font-medium tabular-nums text-foreground">
                    {nf.format(s.values[index])}
                  </span>
                </span>
              ))}
            </ChartTooltip>
          )}
        </div>

        <XAxis labels={labels} />
      </div>
    </ChartFrame>
  )
}

/* ── Stacked bars (part-to-whole) ─────────────────────────────────────────── */

interface StackedProps {
  title: string
  note?: string
  labels: readonly string[]
  series: readonly SeriesSpec[]
}

export function StackedBars({ title, note, labels, series }: Readonly<StackedProps>) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const { index, setIndex } = useHoverIndex()

  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + s.values[i], 0))
  const max = Math.max(...totals) * 1.08
  const ticks = [max, max / 2, 0].map((t) => nf.format(Math.round(t)))

  return (
    <ChartFrame
      title={title}
      note={note}
      legend={<Legend items={series.map((s) => ({ label: s.label, className: s.dotClass }))} />}
      table={{
        columns: ['Month', ...series.map((s) => s.label), 'Total'],
        rows: labels.map((l, i) => [l, ...series.map((s) => s.values[i]), totals[i]]),
      }}
    >
      <div ref={ref} className="relative pl-8 sm:pl-10">
        <YAxis ticks={ticks} />

        {/* Bars are HTML: rounded ends and even gaps survive any width, which
            SVG rects under a stretched viewBox would not. */}
        <div
          className="relative flex h-40 items-end border-b border-border sm:h-52"
          role="img"
          aria-label={`${title}, stacked by channel across ${labels.length} months. Values in the adjacent table.`}
        >
          {labels.map((label, i) => (
            <div key={label} className="flex h-full flex-1 items-end justify-center px-[3%]">
              <div
                data-reveal={inView ? 'shown' : 'pending'}
                className={`flex w-full max-w-[2.75rem] flex-col justify-end gap-0.5 transition-opacity duration-200 ${
                  inView ? 'animate-grow-y' : ''
                } ${index === null || index === i ? 'opacity-100' : 'opacity-40'}`}
                style={{
                  height: `${(totals[i] / max) * 100}%`,
                  transformOrigin: 'bottom',
                  animationDelay: `${i * 70}ms`,
                }}
              >
                {[...series].reverse().map((s) => (
                  <span
                    key={s.label}
                    className="w-full shrink-0 rounded-[3px]"
                    style={{
                      height: `${(s.values[i] / totals[i]) * 100}%`,
                      backgroundColor: s.stroke,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          <HitColumns count={labels.length} labels={labels} index={index} onHover={setIndex} />
          {index !== null && (
            <ChartTooltip x={slotCenterX(index, labels.length)}>
              <span className="mb-1 block font-semibold text-foreground">{labels[index]}</span>
              {series.map((s) => (
                <span key={s.label} className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dotClass}`} />
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="ml-auto pl-3 font-medium tabular-nums text-foreground">
                    {nf.format(s.values[index])}
                  </span>
                </span>
              ))}
              <span className="mt-1 flex border-t border-border pt-1 text-muted-foreground">
                Total
                <span className="ml-auto pl-3 font-semibold tabular-nums text-foreground">
                  {nf.format(totals[index])}
                </span>
              </span>
            </ChartTooltip>
          )}
        </div>

        <XAxis labels={labels} anchor="slot" />
      </div>
    </ChartFrame>
  )
}

/* ── Meter (one ratio against a limit) ────────────────────────────────────── */

interface MeterProps {
  label: string
  percent: number
  caption: string
}

export function Meter({ label, percent, caption }: Readonly<MeterProps>) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const shown = useCountUp(percent, inView, 1200)

  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-rem-75 text-muted-foreground sm:text-rem-80">{label}</span>
        <span className="font-gudlak text-rem-120 font-bold tabular-nums text-foreground sm:text-rem-140">
          {Math.round(inView ? shown : 0)}%
        </span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-series-1 transition-[width] duration-1000 ease-out"
          style={{ width: `${inView ? percent : 0}%` }}
        />
      </div>
      <p className="mt-2 text-rem-70 leading-relaxed text-muted-foreground sm:text-rem-75">{caption}</p>
    </div>
  )
}
