import { CheckCircle2, CircleDot, PlayCircle, ShieldAlert } from 'lucide-react'

// Tiruan tampilan Console, digambar dengan HTML biasa. Isinya sengaja
// menunjukkan alur yang benar-benar ada di produk: agent, versi, playground,
// dan konfirmasi tool tulis.
export default function LandingShowcase() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/95 shadow-lift backdrop-blur">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/15" />
        <span className="ml-3 truncate font-mono text-[11px] text-muted-foreground">
          blayer.id/console/agents/accounting-assistant
        </span>
      </div>

      <div className="grid sm:grid-cols-[170px_1fr]">
        <aside className="hidden flex-col gap-1 border-r border-border p-3 sm:flex">
          {[
            { label: 'Accounting Assistant', isActive: true },
            { label: 'Support Triage', isActive: false },
            { label: 'Invoice Reader', isActive: false },
          ].map((item) => (
            <span
              key={item.label}
              className={
                item.isActive
                  ? 'truncate rounded-md bg-primary/15 px-2.5 py-1.5 text-xs text-primary ring-1 ring-inset ring-primary/30'
                  : 'truncate rounded-md px-2.5 py-1.5 text-xs text-muted-foreground'
              }
            >
              {item.label}
            </span>
          ))}

          <span className="mt-3 px-2.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
            Versi
          </span>
          {['v4 · draf', 'v3 · production'].map((item, index) => (
            <span
              key={item}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground"
            >
              <CircleDot
                className={index === 1 ? 'h-3 w-3 text-primary' : 'h-3 w-3'}
              />
              {item}
            </span>
          ))}
        </aside>

        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <PlayCircle className="h-4 w-4 text-primary" /> Playground
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
              v3 · production
            </span>
          </div>

          <div className="rounded-lg border border-border bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Masukan</p>
            <p className="mt-1.5 text-sm">Berapa laba bulan lalu?</p>
          </div>

          <div className="rounded-lg border border-border bg-background/70 p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              get_profit_loss · READ · 214 ms
            </p>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              {'{ "period": "2026-08", "profit": 12480000 }'}
            </p>
          </div>

          <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <ShieldAlert className="h-3.5 w-3.5" />
              Menunggu konfirmasi · delete_transaction
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Tool yang mengubah data tidak pernah jalan sebelum kamu menyetujuinya.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Latency', value: '1.9 s' },
              { label: 'Token', value: '1.2k/480' },
              { label: 'Biaya', value: '$0.018' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-background/70 px-2.5 py-2"
              >
                <p className="text-[11px] text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
