'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface FormsCategoryForm {
  id: string
  slug: string
  title: string
  image: string
  priceText: string
  isPaid: boolean
  tags: string[]
  countText: string
}

export interface FormsCategoryItem {
  id: string
  name: string
  description: string
  viewLabel: string
  icon: LucideIcon
  availabilityText: string
  actionLabel: string
  emptyText: string
  forms: FormsCategoryForm[]
}

interface Props {
  data: FormsCategoryItem[]
  onLoadFormsExplore: (templateId: string) => void
}

const ALL_TAG = 'SEMUA'

export default function FormsCategory({ data, onLoadFormsExplore }: Props) {
  const [filters, setFilters] = useState({
    activeTags: {} as Record<string, string>,
  })

  const sections = useMemo(() => {
    const getTags = (forms: FormsCategoryForm[]) => {
      const counted = new Map<string, number>()

      forms.forEach((form) =>
        form.tags.forEach((tag) =>
          counted.set(tag, (counted.get(tag) ?? 0) + 1)
        )
      )

      return [...counted.entries()]
        .filter(([, total]) => total > 0)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 6)
        .map(([tag]) => tag)
    }

    const getVisibleForms = (item: FormsCategoryItem, activeTag: string) =>
      activeTag === ALL_TAG
        ? item.forms
        : item.forms.filter((form) => form.tags.includes(activeTag))

    return data.map((item) => {
      const activeTag = filters.activeTags[item.id] ?? ALL_TAG
      const tags = getTags(item.forms)

      return {
        ...item,
        activeTag,
        tags: tags.length ? [ALL_TAG, ...tags] : [],
        visibleForms: getVisibleForms(item, activeTag),
      }
    })
  }, [data, filters.activeTags])

  const editCategoryTag = (categoryId: string, tag: string) => {
    setFilters((prev) => ({
      ...prev,
      activeTags: { ...prev.activeTags, [categoryId]: tag },
    }))
  }

  return (
    <div className="flex flex-col gap-12">
      {sections.map((item) => {
        const Icon = item.icon

        return (
          <section key={item.id} className="border-2 border-foreground bg-paper">
            <div className="flex flex-col gap-4 border-b-2 border-foreground px-5 py-6 sm:px-7">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="brutal-index h-11 w-11 shrink-0">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="min-w-0 break-words font-display text-2xl font-black uppercase leading-none tracking-tight">
                    {item.name}
                  </h3>
                  <Badge variant="outline">{item.viewLabel}</Badge>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onLoadFormsExplore(item.id)}
                >
                  Lihat Semua <ArrowUpRight />
                </Button>
              </div>

              <p className="max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <p className="brutal-eyebrow shrink-0 text-muted-foreground">
                  {item.availabilityText}
                </p>

                {item.tags.length ? (
                  <div className="brutal-scroll-x flex min-w-0 flex-1 gap-2 overflow-x-auto">
                    {item.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => editCategoryTag(item.id, tag)}
                        className={cn(
                          'brutal-eyebrow shrink-0 border-2 border-foreground px-3 py-1.5 transition-colors',
                          tag === item.activeTag
                            ? 'bg-foreground text-background'
                            : 'bg-paper hover:bg-muted'
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {item.visibleForms.length ? (
              <div className="brutal-scroll-x flex snap-x snap-mandatory overflow-x-auto">
                {item.visibleForms.map((form) => (
                  <article
                    key={form.id}
                    className="flex w-[280px] shrink-0 snap-start flex-col justify-between gap-4 border-r-2 border-foreground p-5 last:border-r-0"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full overflow-hidden border-2 border-foreground bg-muted">
                        {form.image ? (
                          <Image
                            src={form.image}
                            alt=""
                            fill
                            sizes="280px"
                            className="object-cover"
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="brutal-hatch absolute inset-0 opacity-20"
                          />
                        )}
                      </div>

                      <h4 className="mt-4 line-clamp-2 break-words font-display text-lg font-black uppercase leading-tight tracking-tight">
                        {form.title}
                      </h4>

                      <p className="mt-2 brutal-eyebrow text-muted-foreground">
                        {form.countText}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <Badge variant={form.isPaid ? 'default' : 'muted'}>
                        {form.priceText}
                      </Badge>
                      <Button asChild size="sm">
                        <Link href={form.slug ? `/f/${form.slug}` : `/forms/${form.id}`}>
                          {item.actionLabel}
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="px-5 py-8 font-mono text-sm leading-relaxed text-muted-foreground sm:px-7">
                {item.emptyText}
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}
