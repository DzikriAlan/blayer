import { Compass, Sparkles, type LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface FormsCategoryItem {
  id: string
  name: string
  tagline: string
  viewLabel: string
  icon: LucideIcon
  totalField: number
  totalForm: number
}

interface Props {
  data: FormsCategoryItem[]
  onLoadFormsTemplate: (templateId: string) => void
  onLoadFormsExplore: (templateId: string) => void
}

export default function FormsCategory({
  data,
  onLoadFormsTemplate,
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

              <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                {item.tagline}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <p className="brutal-eyebrow text-muted-foreground">
                  {String(item.totalField).padStart(2, '0')} FIELDS ·{' '}
                  {String(item.totalForm).padStart(2, '0')} TERSEDIA
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onLoadFormsExplore(item.id)}
                  >
                    <Compass /> Eksplor Kategori
                  </Button>
                  <Button size="sm" onClick={() => onLoadFormsTemplate(item.id)}>
                    <Sparkles /> Use Template
                  </Button>
                </div>
              </div>
            </div>

          </article>
        )
      })}
    </div>
  )
}
