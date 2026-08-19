import { ArrowUpRight, type LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface FormsCategoryItem {
  id: string
  name: string
  /** Naskah dari sisi pengunjung; tagline builder tidak dipakai di sini. */
  description: string
  viewLabel: string
  icon: LucideIcon
  /** Satuan isi kategorinya, mis. "03 LOWONGAN TERBUKA". */
  availabilityText: string
}

interface Props {
  data: FormsCategoryItem[]
  onLoadFormsExplore: (templateId: string) => void
}

/**
 * Etalase kategori di halaman depan.
 *
 * Ditulis untuk yang datang mencari sesuatu untuk diikuti, bukan untuk yang
 * datang membangun: yang ditawarkan isi kategorinya — berapa yang sedang
 * terbuka dan berapa orang yang sudah masuk — bukan templatenya. Pintu ke
 * builder tetap ada di navigasi atas, jadi tidak perlu diulang di sini.
 */
export default function FormsCategory({
  data,
  onLoadFormsExplore,
}: Props) {
  return (
    <div className="border-x-2 border-t-2 border-foreground">
      {data.map((item) => {
        const Icon = item.icon

        return (
          <article
            key={item.id}
            className="border-b-2 border-foreground bg-paper transition-colors hover:bg-muted"
          >
            <div className="flex flex-col gap-5 px-5 py-6 sm:px-7">
              <div className="flex items-start gap-4 sm:gap-6">
                <span className="brutal-index h-11 w-11">
                  <Icon className="h-5 w-5" />
                </span>

                <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-x-3 gap-y-2">
                  <h3 className="min-w-0 break-words font-display text-2xl font-black uppercase leading-none tracking-tight">
                    {item.name}
                  </h3>
                  <Badge variant="outline">{item.viewLabel}</Badge>
                </div>
              </div>

              {/* Lebarnya ditahan supaya tiap keterangan jatuh ke dua baris.
                  Dibiarkan selebar kartu, kalimat sepanjang ini jadi satu
                  baris panjang yang tidak enak dipindai. */}
              <p className="max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <p className="brutal-eyebrow text-muted-foreground">
                  {item.availabilityText}
                </p>
                <Button size="sm" onClick={() => onLoadFormsExplore(item.id)}>
                  Lihat Yang Terbuka <ArrowUpRight />
                </Button>
              </div>
            </div>

          </article>
        )
      })}
    </div>
  )
}
