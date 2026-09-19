import { useInView } from '@/shared/hooks/useInView'
import { useCountUp } from '@/shared/hooks/useCountUp'
import { SectionHead, SourceNote } from './LandingSection'
import { Reveal } from './LandingDecor'

/* Arrivals per hour across a day, and the window a nine-to-six team is actually
   at a desk. The chart is an emphasis form, not a categorical one: the off-hours
   bars carry the brand hue, the covered hours recede to a neutral. The reader
   should see the answer before they read the axis. */

const SHIFT_START = 9
const SHIFT_END = 18

const ARRIVALS = [
  38, 24, 18, 14, 12, 16, 29, 52, 78, 96, 112, 121,
  108, 99, 115, 124, 118, 102, 86, 79, 74, 68, 57, 46,
]

const total = ARRIVALS.reduce((a, b) => a + b, 0)
const offHours = ARRIVALS.reduce((sum, v, h) => (h < SHIFT_START || h >= SHIFT_END ? sum + v : sum), 0)
const OFF_HOURS_SHARE = Math.round((offHours / total) * 100)
const peak = Math.max(...ARRIVALS)

const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`

export default function LandingCoverage() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const share = useCountUp(OFF_HOURS_SHARE, inView, 1100)

  return (
    /* Full-bleed band. The page has been a centred column up to here; breaking
       out of it is what tells the reader a different kind of claim starts. */
    <section id="coverage" className="relative border-y border-border bg-card px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHead
              index="02"
              kicker="The gap"
              title="Most of the day, nobody is at the desk."
              subtitle="A nine-to-six team covers nine of twenty-four hours. The questions do not agree to that schedule."
              variant="left"
            />

            <Reveal variant="fade" delayMs={200}>
              <p className="font-gudlak text-[3rem] font-bold leading-none tabular-nums text-iris sm:text-[4rem]">
                {Math.round(inView ? share : 0)}%
              </p>
              <p className="mt-2 max-w-sm text-rem-90 leading-relaxed text-foreground">
                of the day&rsquo;s questions land outside {hourLabel(SHIFT_START)}&ndash;{hourLabel(SHIFT_END)} —
                waiting until somebody logs in.
              </p>
              <SourceNote>
                Modelled arrival curve, not measured traffic: a weekday shape for a product with users spread across
                time zones, normalised to {total} conversations. Your own curve is the one that matters — this is
                here to make the shape of the problem legible, not to claim a number about your team.
              </SourceNote>
            </Reveal>
          </div>

          <div ref={ref} className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <p className="text-rem-90 font-semibold text-foreground">Conversations started, by hour</p>
                <ul className="flex items-center gap-x-3 gap-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-series-1" aria-hidden="true" />
                    <span className="text-rem-70 text-muted-foreground">Nobody on shift</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                    <span className="text-rem-70 text-muted-foreground">Team available</span>
                  </li>
                </ul>
              </div>

              <div
                className="flex h-40 items-end gap-[2px] sm:h-52"
                role="img"
                aria-label={`Conversations started by hour of day. Peak ${peak} at ${hourLabel(ARRIVALS.indexOf(peak))}. ${OFF_HOURS_SHARE} percent arrive outside ${hourLabel(SHIFT_START)} to ${hourLabel(SHIFT_END)}. Full values in the table below.`}
              >
                {ARRIVALS.map((value, hour) => {
                  const covered = hour >= SHIFT_START && hour < SHIFT_END
                  return (
                    <span
                      key={hour}
                      title={`${hourLabel(hour)} — ${value}`}
                      className={`group/bar relative flex-1 rounded-t-[3px] ${
                        inView ? 'animate-grow-y' : ''
                      } ${covered ? 'bg-muted-foreground/25' : 'bg-series-1'}`}
                      data-reveal={inView ? 'shown' : 'pending'}
                      style={{
                        height: `${(value / peak) * 100}%`,
                        transformOrigin: 'bottom',
                        animationDelay: `${hour * 28}ms`,
                      }}
                    />
                  )
                })}
              </div>

              {/* Shift bracket — says which hours are covered without a second legend */}
              <div className="relative mt-2 h-8">
                <span
                  aria-hidden="true"
                  className="absolute top-0 border-l border-r border-t border-border"
                  style={{
                    left: `${(SHIFT_START / 24) * 100}%`,
                    width: `${((SHIFT_END - SHIFT_START) / 24) * 100}%`,
                    height: '6px',
                  }}
                />
                <span
                  className="absolute top-2 -translate-x-1/2 whitespace-nowrap text-rem-65 text-muted-foreground"
                  style={{ left: `${((SHIFT_START + SHIFT_END) / 2 / 24) * 100}%` }}
                >
                  team on shift
                </span>
                <span className="absolute left-0 top-2 text-rem-65 text-muted-foreground">00:00</span>
                <span className="absolute right-0 top-2 text-rem-65 text-muted-foreground">23:00</span>
              </div>
            </div>

            <table className="sr-only">
              <caption>Conversations started by hour of day</caption>
              <thead>
                <tr><th scope="col">Hour</th><th scope="col">Conversations</th><th scope="col">Team on shift</th></tr>
              </thead>
              <tbody>
                {ARRIVALS.map((value, hour) => (
                  <tr key={hour}>
                    <th scope="row">{hourLabel(hour)}</th>
                    <td>{value}</td>
                    <td>{hour >= SHIFT_START && hour < SHIFT_END ? 'yes' : 'no'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
