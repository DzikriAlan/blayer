import { SeriesLines, StackedBars, type SeriesSpec } from './LandingCharts'
import { SectionHead, BentoCard, SourceNote } from './LandingSection'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'] as const

/* Stroke colours come from the validated categorical slots. Slots are assigned
   in fixed order and never cycled — a fourth channel would fold into "Other"
   rather than take a generated hue. */
const CHANNELS: SeriesSpec[] = [
  {
    label: 'Website widget',
    values: [180, 240, 310, 395, 470, 560, 660, 780],
    stroke: 'hsl(var(--series-1))',
    dotClass: 'bg-series-1',
  },
  {
    label: 'In-app',
    values: [90, 120, 165, 210, 250, 310, 360, 430],
    stroke: 'hsl(var(--series-2))',
    dotClass: 'bg-series-2',
  },
  {
    label: 'API',
    values: [30, 45, 70, 95, 130, 170, 215, 280],
    stroke: 'hsl(var(--series-3))',
    dotClass: 'bg-series-3',
  },
]

export default function LandingImpact() {
  return (
    <section id="impact" className="relative px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHead
          index="03"
          kicker="Where the volume goes"
          title="Widget first, then in-app, then the API."
          subtitle="Teams almost always start with the script tag because it ships the same afternoon. In-app follows once the agent has earned trust; the API arrives when someone wants it inside a workflow."
          variant="left"
        />

        <div className="grid gap-4 lg:grid-cols-5">
          <BentoCard className="lg:col-span-3" variant="left">
            <SeriesLines
              title="Conversations by channel"
              note="Modelled adoption shape"
              labels={MONTHS}
              series={CHANNELS}
            />
            <SourceNote>
              A modelled ramp, not aggregated customer data — Blayer collects no telemetry, so there is nothing
              real to plot. It is here to show the order channels tend to arrive in, which is the claim above.
            </SourceNote>
          </BentoCard>

          <BentoCard className="lg:col-span-2" delayMs={120} variant="right">
            <StackedBars
              title="Monthly volume"
              note="Same modelled shape, stacked"
              labels={MONTHS}
              series={CHANNELS}
            />
          </BentoCard>
        </div>
      </div>
    </section>
  )
}
