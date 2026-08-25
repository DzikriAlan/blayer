'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/components/ui/button'
import FormsPoster, { type FormsPosterForm } from './formsPoster'

export interface FormsCategoryItem {
  id: string
  name: string
  description: string
  viewLabel: string
  icon: LucideIcon
  availabilityText: string
  actionLabel: string
  countLabel: string
  fieldLabel: string
  emptyText: string
  hasPriceBadge: boolean
  forms: FormsPosterForm[]
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
    const getTags = (forms: FormsPosterForm[]) => {
      const counted = new Map<string, number>()

      forms.forEach((form) =>
        form.tags.forEach((tag) => counted.set(tag, (counted.get(tag) ?? 0) + 1))
      )

      return [...counted.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 6)
        .map(([tag]) => tag)
    }

    return data.map((item) => {
      const activeTag = filters.activeTags[item.id] ?? ALL_TAG
      const tags = getTags(item.forms)

      return {
        ...item,
        activeTag,
        tags: tags.length ? [ALL_TAG, ...tags] : [],
        visibleForms:
          activeTag === ALL_TAG
            ? item.forms
            : item.forms.filter((form) => form.tags.includes(activeTag)),
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
    <div className="flex flex-col gap-16">
      {sections.map((item) => {
        const Icon = item.icon

        return (
          <section key={item.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" />
                <h3 className="truncate font-display text-xl font-black uppercase leading-none tracking-tight sm:text-2xl">
                  {item.name}
                </h3>
                <span className="brutal-eyebrow hidden shrink-0 whitespace-nowrap text-muted-foreground sm:inline">
                  {item.availabilityText}
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => onLoadFormsExplore(item.id)}
              >
                <span className="hidden sm:inline">Lihat Semua</span>
                <ArrowUpRight />
              </Button>
            </div>

            <p className="brutal-eyebrow mt-2 text-muted-foreground sm:hidden">
              {item.availabilityText}
            </p>

            <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>

            {item.tags.length ? (
              <div className="brutal-scroll-hidden mt-5 flex gap-2 overflow-x-auto">
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

            {item.visibleForms.length ? (
              <div className="brutal-scroll-hidden -mx-1 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1 sm:mt-7 sm:gap-6">
                {item.visibleForms.map((form) => (
                  <FormsPoster
                    key={form.id}
                    form={form}
                    actionLabel={item.actionLabel}
                    countLabel={item.countLabel}
                    fieldLabel={item.fieldLabel}
                    hasBanner
                    isFixedBanner
                    hasPriceBadge={item.hasPriceBadge}
                    className="w-[78vw] max-w-[320px] shrink-0 snap-start sm:w-[360px] sm:max-w-none"
                  />
                ))}
              </div>
            ) : (
              <p className="mt-7 font-mono text-sm leading-relaxed text-muted-foreground">
                {item.emptyText}
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}
