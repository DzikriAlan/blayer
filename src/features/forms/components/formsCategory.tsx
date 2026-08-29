'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/components/ui/button'
import { LoadData } from '@/shared/components/load-data'
import FormsPoster, { type FormsPosterForm } from './formsPoster'

export interface FormsCategoryItem {
  id: string
  name: string
  description: string
  icon: LucideIcon
  availabilityText: string
  actionLabel: string
  countLabel: string
  fieldLabel: string
  emptyTitle: string
  emptySubtitle: string
  forms: FormsPosterForm[]
}

interface Props {
  data: FormsCategoryItem[]
  onLoadFormsExplore: (templateId: string) => void
}

const ALL_ID = ''

export default function FormsCategory({ data, onLoadFormsExplore }: Props) {
  const [filters, setFilters] = useState({ activeId: ALL_ID })

  const category = useMemo(() => {
    const active = data.find((item) => item.id === filters.activeId)

    const getListedForms = (item: FormsCategoryItem) =>
      item.forms.map((form) => ({
        form,
        categoryId: item.id,
        actionLabel: item.actionLabel,
        countLabel: item.countLabel,
        fieldLabel: item.fieldLabel,
      }))

    const totalForm = data.reduce((total, item) => total + item.forms.length, 0)

    const listedForms = active
      ? getListedForms(active)
      : data.flatMap((item) => getListedForms(item))

    const buttons = [
      {
        id: ALL_ID,
        name: 'Semua',
        total: totalForm,
        icon: null as LucideIcon | null,
      },
      ...data.map((item) => ({
        id: item.id,
        name: item.name,
        total: item.forms.length,
        icon: item.icon,
      })),
    ]

    return {
      buttons,
      activeId: filters.activeId,
      description: active
        ? active.description
        : 'Semua kategori acara yang pendaftarannya sedang dibuka. Pilih salah satu kategori untuk mempersempit daftarnya.',
      availabilityText: active
        ? active.availabilityText
        : `${String(totalForm).padStart(2, '0')} ACARA TERBUKA`,
      hasExplore: !!active,
      listState: {
        data: listedForms,
        isEmpty: !listedForms.length,
        emptyTitle: active ? active.emptyTitle : 'Belum Ada Acara Dibuka',
        emptySubtitle: active
          ? active.emptySubtitle
          : 'Belum ada acara yang pendaftarannya dibuka sekarang. Kembali lagi nanti.',
        emptyImage: '/no-data.svg',
      },
      listedForms,
    }
  }, [data, filters.activeId])

  const editCategory = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      activeId: prev.activeId === categoryId ? ALL_ID : categoryId,
    }))
  }

  return (
    <div>
      <div className="brutal-scroll-hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {category.buttons.map((item) => {
          const Icon = item.icon
          const isActive = item.id === category.activeId

          return (
            <button
              key={item.id || 'all'}
              type="button"
              onClick={() => editCategory(item.id)}
              className={cn(
                'brutal-eyebrow flex shrink-0 items-center gap-2 border-2 border-foreground px-3 py-2.5 transition-colors',
                isActive
                  ? 'bg-foreground text-background'
                  : 'bg-paper hover:bg-muted'
              )}
            >
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              {item.name}
              <span className={isActive ? 'opacity-70' : 'text-muted-foreground'}>
                {String(item.total).padStart(2, '0')}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="brutal-eyebrow text-muted-foreground">
            {category.availabilityText}
          </p>
          <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">
            {category.description}
          </p>
        </div>

        {category.hasExplore ? (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => onLoadFormsExplore(category.activeId)}
          >
            <span className="hidden sm:inline">Lihat Semua</span>
            <ArrowUpRight />
          </Button>
        ) : null}
      </div>

      {/* Tinggi minimumnya disamakan dengan satu kartu acara supaya kategori
          kosong tidak menciutkan halaman saat penyaringnya berpindah. */}
      <LoadData
        response={category.listState}
        className="mt-8 min-h-[368px] sm:min-h-[435px]"
      >
        {/* Di ponsel kartunya digulir menyamping dengan jari — tanpa bilah
            gulir — lalu kembali jadi kisi begitu ruangnya cukup. */}
        <div className="brutal-scroll-hidden -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {category.listedForms.map((item) => (
            <FormsPoster
              key={item.form.id}
              form={item.form}
              actionLabel={item.actionLabel}
              countLabel={item.countLabel}
              fieldLabel={item.fieldLabel}
              hasBanner
              isFixedBanner
              className="w-[78vw] max-w-[320px] shrink-0 snap-start sm:w-auto sm:max-w-none"
            />
          ))}
        </div>
      </LoadData>
    </div>
  )
}
