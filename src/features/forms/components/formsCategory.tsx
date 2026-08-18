import Link from 'next/link'
import { ArrowUpRight, Compass, Sparkles, X, type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export interface FormsCategoryForm {
  id: string
  title: string
  description: string
  totalField: number
  totalResponse: number
}

export interface FormsCategoryItem {
  id: string
  name: string
  tagline: string
  viewLabel: string
  icon: LucideIcon
  totalField: number
  totalForm: number
  isExploring: boolean
  forms: FormsCategoryForm[]
  emptyExploreTitle: string
  emptyExploreSubtitle: string
}

interface Props {
  data: FormsCategoryItem[]
  isLoading: boolean
  onLoadFormsTemplate: (templateId: string) => void
  onLoadFormsExplore: (templateId: string) => void
}

export default function FormsCategory({
  data,
  isLoading,
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
            className={cn(
              'border-b-2 border-foreground transition-colors',
              item.isExploring ? 'bg-muted' : 'bg-paper'
            )}
          >
            <div className="flex flex-col gap-5 px-5 py-6 sm:px-7">
              <div className="flex items-start gap-4 sm:gap-6">
                <span
                  className={cn(
                    'brutal-index h-11 w-11',
                    item.isExploring && 'bg-primary'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-x-3 gap-y-2">
                  <h3 className="min-w-0 break-words font-display text-2xl font-black uppercase leading-none tracking-tight">
                    {item.name}
                  </h3>
                  <Badge variant={item.isExploring ? 'default' : 'outline'}>
                    {item.viewLabel}
                  </Badge>
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
                    variant={item.isExploring ? 'primary' : 'outline'}
                    onClick={() => onLoadFormsExplore(item.id)}
                  >
                    {item.isExploring ? <X /> : <Compass />}
                    {item.isExploring ? 'Tutup' : 'Eksplor Kategori'}
                  </Button>
                  <Button size="sm" onClick={() => onLoadFormsTemplate(item.id)}>
                    <Sparkles /> Use Template
                  </Button>
                </div>
              </div>
            </div>

            {item.isExploring ? (
              <div className="border-t-2 border-foreground bg-paper">
                <div className="flex items-stretch gap-3 px-5 pt-5 sm:px-7">
                  <span className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
                    TERKAIT — {item.name}
                  </span>
                  <span aria-hidden className="brutal-hatch flex-1 opacity-20" />
                </div>

                {isLoading ? (
                  <div className="flex flex-col gap-2 p-5 sm:p-7">
                    {[0, 1].map((skeleton) => (
                      <Skeleton key={skeleton} className="h-20 w-full" />
                    ))}
                  </div>
                ) : null}

                {!isLoading && !item.forms.length ? (
                  <div className="px-5 py-7 sm:px-7">
                    <p className="font-display text-xl font-black uppercase leading-none tracking-tight">
                      {item.emptyExploreTitle}
                    </p>
                    <p className="mt-3 max-w-md font-mono text-xs leading-relaxed text-muted-foreground">
                      {item.emptyExploreSubtitle}
                    </p>
                    <Button
                      className="mt-5"
                      size="sm"
                      onClick={() => onLoadFormsTemplate(item.id)}
                    >
                      <Sparkles /> Use Template
                    </Button>
                  </div>
                ) : null}

                {item.forms.map((form) => (
                  <Link
                    key={form.id}
                    href={`/forms/${form.id}`}
                    className="group flex items-start gap-4 border-t-2 border-foreground px-5 py-5 transition-colors hover:bg-muted sm:px-7"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-display text-lg font-black uppercase leading-tight tracking-tight">
                        {form.title}
                      </p>
                      <p className="mt-2 line-clamp-2 font-mono text-xs leading-relaxed text-muted-foreground">
                        {form.description}
                      </p>
                      <p className="brutal-eyebrow mt-3 text-muted-foreground">
                        {String(form.totalField).padStart(2, '0')} FIELDS ·{' '}
                        {String(form.totalResponse).padStart(2, '0')} RESPONSES
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 shrink-0 transition-colors group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
