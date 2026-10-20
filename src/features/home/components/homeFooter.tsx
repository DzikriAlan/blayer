export default function HomeFooter() {
  return (
    <footer className="flex w-full max-w-[1360px] flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border px-[clamp(16px,4vw,48px)] py-7">
      <span className="font-display text-2xl tracking-tight">blayer</span>
      <nav aria-label="Tautan footer" className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-muted-foreground">
        <a href="#" className="py-2">Bantuan</a>
        <a href="#" className="py-2">Kebijakan Privasi</a>
        <a href="#" className="py-2">Syarat Penggunaan</a>
      </nav>
      <span className="text-xs text-muted-foreground">© 2026 Blayer · Foto oleh Unsplash</span>
    </footer>
  )
}
