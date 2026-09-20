import { LANDING_STACK } from './landingCatalog'

// Design aslinya memasang deretan logo pelanggan di sini. Blayer belum punya
// pengguna yang bisa disebut, dan mengarangnya bukan pilihan — jadi yang
// dipajang adalah yang benar-benar dipakai membangunnya.
export default function LandingStack() {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground">Dibangun di atas</p>

      <ul className="mt-8 grid w-full grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
        {LANDING_STACK.map((item) => (
          <li
            key={item}
            className="text-center text-sm text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
