import Link from 'next/link'
import { ArrowUpRight, Clock3 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import FormsFacepile from './formsFacepile'

export interface FormsProjectItem {
  id: string
  slug: string
  title: string
  tooltip: string
  priceText: string
  isPaid: boolean
  postedText: string
  tags: string[]
  summary: string
  totalFields: number
  totalResponses: number
}

interface Props {
  data: FormsProjectItem[]
  actionLabel: string
  countLabel: string
  fieldLabel: string
}

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
          href={project.slug ? `/f/${project.slug}` : `/forms/${project.id}`}
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
                total={project.totalResponses}
                seed={project.id}
                label={countLabel}
              />
              <span className="brutal-eyebrow text-muted-foreground">
                · {String(project.totalFields).padStart(2, '0')} {fieldLabel}
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
