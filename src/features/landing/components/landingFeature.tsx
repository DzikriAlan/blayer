import { LANDING_FEATURES } from './landingCatalog'

export default function LandingFeature() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {LANDING_FEATURES.map((feature) => {
        const Icon = feature.icon

        return (
          <li
            key={feature.id}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <span
              aria-hidden
              className="glow-soft pointer-events-none absolute -right-16 -top-16 h-40 w-40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />

            <div className="flex items-center justify-between gap-3">
              <span className="index-badge">
                <Icon className="h-4 w-4" />
              </span>

              {feature.isReady ? null : (
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                  Sedang dibangun
                </span>
              )}
            </div>

            <h3 className="mt-5 text-lg font-medium tracking-tight">
              {feature.title}
            </h3>

            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
