import { Bot } from 'lucide-react'
import { useInView } from '@/shared/hooks/useInView'
import { StatTile, TrendArea, Meter, type StatSpec } from './LandingCharts'
import { TrafficLights } from './LandingWindow'

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'] as const
const RESOLVED = [420, 468, 512, 505, 588, 640, 702, 688, 770, 845, 910, 1012] as const

const STATS: StatSpec[] = [
  {
    label: 'Conversations this month',
    value: 12480,
    deltaLabel: '+18% vs last month',
    direction: 'up',
    spark: [40, 44, 41, 52, 58, 57, 66, 74, 80, 92],
    seriesClass: 'text-series-1',
  },
  {
    label: 'Resolved without a human',
    value: 72,
    suffix: '%',
    deltaLabel: '+9 pts',
    direction: 'up',
    spark: [48, 51, 50, 56, 59, 62, 64, 67, 70, 72],
    seriesClass: 'text-series-2',
  },
  {
    label: 'Median first reply',
    value: 0.8,
    suffix: 's',
    decimals: 1,
    deltaLabel: '34% faster',
    direction: 'down',
    spark: [22, 20, 19, 17, 16, 14, 13, 11, 10, 8],
    seriesClass: 'text-series-3',
  },
]

/** The hero's product shot — a live, animated console rather than a screenshot. */
export default function LandingDashboard() {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '0px' })

  return (
    <div
      ref={ref}
      className="group/window overflow-hidden rounded-tl-2xl border-l border-t border-border bg-background shadow-2xl"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2.5 sm:px-4">
        <TrafficLights />
        <span className="ml-1 flex min-w-0 items-center gap-1.5">
          <Bot className="h-3.5 w-3.5 shrink-0 text-iris" aria-hidden="true" />
          <span className="truncate text-rem-75 font-medium text-muted-foreground">
            Blayer — Agent Console
          </span>
        </span>
        <span className="ml-auto hidden shrink-0 items-center gap-1.5 sm:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-series-2" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-series-2" />
          </span>
          <span className="text-rem-70 text-muted-foreground">live</span>
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
          {STATS.map((stat, i) => (
            <div key={stat.label} className={i === 2 ? 'col-span-2 lg:col-span-1' : undefined}>
              <StatTile stat={stat} active={inView} delayMs={i * 110} />
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-3 lg:col-span-2">
            <TrendArea
              title="Conversations handled"
              note="Demo workspace"
              labels={WEEKS}
              values={RESOLVED}
              heightClass="h-32 sm:h-40"
            />
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-border bg-background p-4">
            <Meter
              label="Deflection rate"
              percent={72}
              caption="Share of conversations closed by the agent with no human in the loop."
            />
          </div>
        </div>

        <div className="mt-3 border-t border-border pt-2.5">
          <p className="text-rem-65 leading-relaxed text-muted-foreground">
            Figures from a seeded demo workspace, shown so the console is not empty on a marketing page. They are
            not aggregated customer data — Blayer runs on your infrastructure and reports nothing back.
          </p>
        </div>
      </div>
    </div>
  )
}
