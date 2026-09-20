import { Check, CircleDot, ShieldAlert } from 'lucide-react'

import { LANDING_PRODUCTS } from './landingCatalog'

const [primary, playground, tools, knowledge, guardrail, observability, keys] =
  LANDING_PRODUCTS

const CARD =
  'relative overflow-hidden rounded-xl border border-border bg-card p-6'

// Tiap kartu membawa tiruan kecil bagiannya sendiri, digambar dengan HTML biasa
// supaya isinya persis alur yang ada di produk.
export default function LandingBento() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className={`${CARD} lg:col-span-2 lg:row-span-2`}>
        <span
          aria-hidden
          className="mesh-soft pointer-events-none absolute inset-0 opacity-70"
        />
        <div className="relative flex h-full flex-col">
          <primary.icon className="h-5 w-5 text-primary" />
          <h3 className="mt-4 text-xl font-medium tracking-tight">
            {primary.title}
          </h3>
          <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {primary.description}
          </p>

          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {primary.points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {point}
              </li>
            ))}
          </ul>

          <ul className="mt-auto flex flex-col gap-2 pt-8">
            {[
              { label: 'v4 · draf', isProduction: false },
              { label: 'v3 · production', isProduction: true },
              { label: 'v2 · arsip', isProduction: false },
            ].map((item) => (
              <li
                key={item.label}
                className={
                  item.isProduction
                    ? 'flex items-center gap-2 rounded-lg bg-primary/15 px-3 py-2 text-sm text-primary ring-1 ring-inset ring-primary/30'
                    : 'flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground'
                }
              >
                <CircleDot className="h-3.5 w-3.5" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={CARD}>
        <playground.icon className="h-5 w-5 text-primary" />
        <h3 className="mt-4 text-lg font-medium tracking-tight">{playground.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {playground.description}
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <p className="ml-auto max-w-[80%] rounded-lg bg-primary/15 px-3 py-2 text-xs text-foreground">
            Berapa laba bulan lalu?
          </p>
          <p className="mr-auto max-w-[90%] rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
            Laba bulan lalu Rp12.480.000.
          </p>
        </div>
      </div>

      <div className={CARD}>
        <guardrail.icon className="h-5 w-5 text-primary" />
        <h3 className="mt-4 text-lg font-medium tracking-tight">{guardrail.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {guardrail.description}
        </p>

        <div className="mt-5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <ShieldAlert className="h-3.5 w-3.5" />
            Menunggu konfirmasi · delete_transaction
          </p>
        </div>
      </div>

      <div className={CARD}>
        <tools.icon className="h-5 w-5 text-primary" />
        <h3 className="mt-4 text-lg font-medium tracking-tight">{tools.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {tools.description}
        </p>

        <ul className="mt-5 flex flex-col gap-2 font-mono text-[11px] text-muted-foreground">
          {['GET  /ai/tools/profit-loss', 'GET  /ai/tools/invoices', 'POST /ai/tools/refund'].map(
            (line) => (
              <li key={line} className="rounded-lg border border-border px-3 py-2">
                {line}
              </li>
            )
          )}
        </ul>
      </div>

      <div className={CARD}>
        <knowledge.icon className="h-5 w-5 text-primary" />
        <h3 className="mt-4 text-lg font-medium tracking-tight">{knowledge.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {knowledge.description}
        </p>

        <ul className="mt-5 flex flex-col gap-2">
          {['Kebijakan refund', 'SOP penagihan', 'Glosarium akun'].map((item) => (
            <li
              key={item}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground"
            >
              {item}
              <span className="text-[11px]">terpasang</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={CARD}>
        <observability.icon className="h-5 w-5 text-primary" />
        <h3 className="mt-4 text-lg font-medium tracking-tight">
          {observability.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {observability.description}
        </p>

        <dl className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: 'Runs', value: '1.284' },
            { label: 'Sukses', value: '99,1%' },
            { label: 'Biaya', value: '$18,40' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-background/60 px-2.5 py-2"
            >
              <dt className="text-[11px] text-muted-foreground">{item.label}</dt>
              <dd className="mt-0.5 text-sm font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={`${CARD} lg:col-span-3`}>
        <keys.icon className="h-5 w-5 text-primary" />
        <h3 className="mt-4 text-lg font-medium tracking-tight">{keys.title}</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {keys.description}
        </p>

        <ul className="mt-5 grid gap-2 sm:grid-cols-3">
          {[
            { label: 'blr_9f2c…', environment: 'PRODUCTION' },
            { label: 'blr_41ab…', environment: 'STAGING' },
            { label: 'blr_77de…', environment: 'DEVELOPMENT' },
          ].map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs"
            >
              <span className="font-mono text-muted-foreground">{item.label}</span>
              <span className="text-[11px] text-muted-foreground">{item.environment}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
