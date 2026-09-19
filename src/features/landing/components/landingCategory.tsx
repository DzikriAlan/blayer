'use client'

import { useMemo, useState } from 'react'
import { type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { LoadData } from '@/shared/components/load-data'
import LandingPoster, { type LandingEvent } from './landingPoster'

export interface LandingCategoryItem {
  id: string
  name: string
  icon: LucideIcon
  actionLabel: string
  countLabel: string
  fieldLabel: string
  emptyTitle: string
  emptySubtitle: string
  events: LandingEvent[]
}

interface Props {
  data: LandingCategoryItem[]
}

const ALL_ID = ''

export default function LandingCategory({ data }: Props) {
  const [filters, setFilters] = useState({ activeId: ALL_ID })

  const category = useMemo(() => {
    const active = data.find((item) => item.id === filters.activeId)

    const getListedEvents = (item: LandingCategoryItem) =>
      item.events.map((event) => ({
        event,
        categoryId: item.id,
        actionLabel: item.actionLabel,
        countLabel: item.countLabel,
        fieldLabel: item.fieldLabel,
      }))

    const totalEvent = data.reduce(
      (total, item) => total + item.events.length,
      0
    )

    const listedEvents = active
      ? getListedEvents(active)
      : data.flatMap((item) => getListedEvents(item))

    const buttons = [
      {
        id: ALL_ID,
        name: 'Semua',
        total: totalEvent,
        icon: null as LucideIcon | null,
      },
      ...data.map((item) => ({
        id: item.id,
        name: item.name,
        total: item.events.length,
        icon: item.icon,
      })),
    ]

    return {
      buttons,
      activeId: filters.activeId,
      listState: {
        data: listedEvents,
        isEmpty: !listedEvents.length,
        emptyTitle: active ? active.emptyTitle : 'Belum Ada Acara Dibuka',
        emptySubtitle: active
          ? active.emptySubtitle
          : 'Belum ada acara yang pendaftarannya dibuka sekarang. Kembali lagi nanti.',
        emptyImage: '/no-data.svg',
      },
      listedEvents,
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
      <div className="flex items-center gap-3">
        <div className="brutal-scroll-hidden -mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1">
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
                <span
                  className={isActive ? 'opacity-70' : 'text-muted-foreground'}
                >
                  {String(item.total).padStart(2, '0')}
                </span>
              </button>
            )
          })}
        </div>
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
          {category.listedEvents.map((item) => (
            <LandingPoster
              key={item.event.id}
              event={item.event}
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
