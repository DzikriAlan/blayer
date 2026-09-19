import { LANDING_FEATURES } from './landingCatalog'

export default function LandingFeature() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {LANDING_FEATURES.map((feature) => {
        const Icon = feature.icon

        return (
          <li
            key={feature.id}
            className="flex flex-col border-2 border-foreground bg-paper p-5 transition-shadow hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="brutal-index h-10 w-10 shrink-0">
                <Icon className="h-5 w-5" />
              </span>

              {feature.isReady ? null : (
                <span className="brutal-eyebrow border-2 border-foreground px-2 py-1 text-muted-foreground">
                  SEDANG DIBANGUN
                </span>
              )}
            </div>

            <h3 className="mt-5 break-words font-display text-lg font-black uppercase leading-tight tracking-tight sm:text-xl">
              {feature.title}
            </h3>

            <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
