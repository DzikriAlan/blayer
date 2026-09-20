import { LANDING_QUESTIONS } from './landingCatalog'

// Ruang ini pada design aslinya diisi kutipan pengguna. Blayer belum punya
// pengguna yang bisa dikutip, dan kutipan karangan tidak dipasang di sini —
// yang tampil adalah pertanyaan yang memang muncul saat orang menilai platform
// seperti ini.
export default function LandingCommunity() {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {LANDING_QUESTIONS.map((item) => (
        <article
          key={item.id}
          className="mb-4 break-inside-avoid rounded-xl border border-border bg-card p-5"
        >
          <h3 className="text-sm font-medium">{item.question}</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </p>
        </article>
      ))}
    </div>
  )
}
