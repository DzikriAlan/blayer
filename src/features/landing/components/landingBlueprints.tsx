import { LANDING_BLUEPRINTS } from './landingCatalog'

export default function LandingBlueprints() {
  const wide = LANDING_BLUEPRINTS.filter((item) => item.isWide)
  const rest = LANDING_BLUEPRINTS.filter((item) => !item.isWide)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {wide.map((item) => (
          <article
            key={item.id}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-6"
          >
            <span
              aria-hidden
              className="mesh-soft pointer-events-none absolute inset-0 opacity-60"
            />
            <div className="relative">
              <h3 className="text-lg font-medium tracking-tight">{item.title}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {item.parts.map((part) => (
                  <li
                    key={part}
                    className="rounded-md border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {part}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rest.map((item) => (
          <article key={item.id} className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>

            <ul className="mt-4 flex flex-wrap gap-1.5">
              {item.parts.map((part) => (
                <li key={part} className="text-[11px] text-muted-foreground/80">
                  {part}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
