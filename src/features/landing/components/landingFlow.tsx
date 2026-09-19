import { LANDING_STATS, LANDING_STEPS } from './landingCatalog'

export default function LandingFlow() {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <span className="pixel-label text-primary">Cara kerjanya</span>
        <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Otaknya di sini,
          <br />
          datanya tetap di sana.
        </h2>
        <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
          Aplikasimu memanggil satu endpoint. Blayer memuat konfigurasi agent dan
          menjalankannya. Saat agent butuh data, yang dipanggil adalah endpoint
          milik projectmu sendiri.
        </p>

        <dl className="mt-8 flex flex-wrap gap-3">
          {LANDING_STATS.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.key}
                className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2"
              >
                <Icon aria-hidden className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="text-sm font-medium">{stat.value}</dd>
              </div>
            )
          })}
        </dl>
      </div>

      {/* Rel vertikal: tiap langkah tersambung ke langkah berikutnya, jadi
          urutannya terbaca sebagai alur, bukan empat kotak yang berdiri sendiri. */}
      <ol className="relative flex flex-col gap-4 pl-8 sm:pl-10">
        <span
          aria-hidden
          className="absolute bottom-6 left-[15px] top-6 w-px bg-gradient-to-b from-primary/60 via-border to-transparent sm:left-[19px]"
        />

        {LANDING_STEPS.map((step, index) => {
          const Icon = step.icon

          return (
            <li key={step.id} className="relative">
              <span className="absolute -left-8 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-primary sm:-left-10 sm:h-10 sm:w-10">
                <Icon className="h-4 w-4" />
              </span>

              <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-medium tracking-tight">
                    {step.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
