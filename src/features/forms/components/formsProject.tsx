import Link from 'next/link'
import { ArrowUpRight, Clock3 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import FormsFacepile from './formsFacepile'

export interface FormsProjectItem {
  id: string
  title: string
  tooltip: string
  /** Anggaran yang ditetapkan pemilik proyek. */
  priceText: string
  isPaid: boolean
  postedText: string
  tags: string[]
  summary: string
  totalField: number
  totalResponse: number
}

interface Props {
  data: FormsProjectItem[]
  actionLabel: string
  countLabel: string
  fieldLabel: string
}

/**
 * Papan proyek freelance.
 *
 * Yang dicari orang di papan seperti ini selalu sama dan selalu duluan:
 * berapa anggarannya, lalu berapa banyak yang sudah menawar. Keduanya
 * diletakkan di kepala kartu — anggaran sebagai pita hitam yang tidak bisa
 * dilewatkan mata, jumlah penawaran tepat di bawahnya — baru judul dan sisa
 * keterangannya.
 */
export default function FormsProject({
  data,
  actionLabel,
  countLabel,
  fieldLabel,
}: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((project) => (
        <Link
          key={project.id}
          href={`/forms/${project.id}`}
          // min-w-0 wajib: kartu ini item grid, dan item grid menolak
          // menyempit di bawah lebar min-content isinya. Baris chip yang
          // whitespace-nowrap membuat min-content itu selebar seluruh chip,
          // sehingga satu kartu memaksa seluruh halaman menggeser ke samping
          // di layar ponsel — bukan menggulir di dalam barisan chipnya.
          className="group flex min-w-0 flex-col border-2 border-foreground bg-paper transition-shadow hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]"
        >
          <div className="flex items-center justify-between gap-3 border-b-2 border-foreground bg-foreground px-5 py-3 text-background">
            <span className="brutal-eyebrow opacity-70">BUDGET</span>
            <span className="font-display text-lg font-black tracking-tight">
              {project.isPaid ? project.priceText : 'Nego'}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-5">
            <h2
              title={project.tooltip}
              className="line-clamp-2 break-words font-display text-base font-black uppercase leading-tight tracking-tight sm:text-lg"
            >
              {project.title}
            </h2>

            <p className="brutal-eyebrow flex items-center gap-1.5 text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              {project.postedText}
            </p>

            {/* Chip dibiarkan satu baris dan digeser ke samping, sama seperti
                di papan lowongan, supaya tinggi tiap kartu tetap sama. */}
            <div className="brutal-scroll-thin flex gap-2 overflow-x-auto pb-1">
              {project.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="shrink-0 whitespace-nowrap"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {project.summary ? (
              <p className="line-clamp-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {project.summary}
              </p>
            ) : null}

            <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1">
              <FormsFacepile
                total={project.totalResponse}
                seed={project.id}
                label={countLabel}
              />
              <span className="brutal-eyebrow text-muted-foreground">
                · {String(project.totalField).padStart(2, '0')} {fieldLabel}
              </span>
            </div>

            <div className="flex justify-end">
              <span className="brutal-eyebrow flex items-center gap-2 border-2 border-foreground px-3 py-2 transition-colors group-hover:bg-foreground group-hover:text-background">
                {actionLabel}
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
