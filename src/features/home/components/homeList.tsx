'use client'

import { useEffect, useMemo, useState } from 'react'
import { RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { DataSearch, DataSearchGroup } from '@/features/search/types/searchTypes'
import { useSearchStates } from '@/features/search/states/searchStates'
import { useSearchControllers } from '@/features/search/controllers/searchControllers'
import { getCompactCount, getDurationLabel } from '@/shared/lib/videoFormat'
import HomeBanner from './homeBanner'
import HomeCard from './homeCard'
import type { HomeCardItem } from './homeCard'
import HomeCategories from './homeCategories'
import { HOME_ALL_CATEGORY, HOME_ALL_PAYLOADS, HOME_CATEGORIES, HOME_SEARCH_DEFAULTS } from './homeCatalog'

const SKELETON_COUNT = 8
// Kartu di baris pertama terlihat tanpa scroll, jadi gambarnya dimuat segera
const PRIORITY_CARDS = 4

export default function HomeList() {
  const { searchList, setGetSearchList } = useSearchStates()
  const { fetchSearchList } = useSearchControllers()
  const [filters, setFilters] = useState({
    activeCategory: HOME_ALL_CATEGORY,
  })

  const data = useMemo(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getCategoryName = (query: string) => HOME_CATEGORIES.find((category) => category.query === query)?.name ?? ''

    const getMappedItem = (video: DataSearch, category: string): HomeCardItem => ({
      id: video.id,
      href: `/watch/${video.id}`,
      title: video.title,
      channel: video.channel,
      isVerified: video.verifiedChannel,
      meta: [video.views ? `${getCompactCount(video.views)} ditonton` : '', video.published].filter(Boolean).join(' · '),
      duration: video.isLive ? 'LIVE' : getDurationLabel(video.duration),
      category,
      imageSrc: video.thumbnail,
    })

    // "Semua" mengambil video bergiliran dari tiap kategori agar beranda tidak didominasi satu topik
    const getInterleaved = (groups: DataSearchGroup[]) => {
      const seen = new Set<string>()
      const items: HomeCardItem[] = []
      const longest = Math.max(0, ...groups.map((group) => group.items.length))
      for (let index = 0; index < longest; index++) {
        for (const group of groups) {
          const video = group.items[index]
          if (video && !seen.has(video.id)) {
            seen.add(video.id)
            items.push(getMappedItem(video, getCategoryName(group.q)))
          }
        }
      }
      return items
    }

    const mappedList = getInterleaved(searchList.data)
    const tabs = [HOME_ALL_CATEGORY, ...HOME_CATEGORIES.map((category) => category.name)].map((name) => ({
      name,
      isActive: name === filters.activeCategory,
    }))

    return {
      data: mappedList,
      tabs,
      isLoading: searchList.status === 'loading',
      isError: searchList.status === 'error',
      isEmpty: searchList.status === 'empty' || (searchList.status === 'success' && !mappedList.length),
      emptyTitle: 'Video Tidak Ditemukan',
      emptySubtitle: 'Belum ada video untuk kategori ini. Coba kategori lain.',
      emptyImage: '/no-data.svg',
      errorTitle: searchList.statusTitle,
      errorSubtitle: searchList.statusSubtitle,
      featuredHref: mappedList[0]?.href ?? '/',
      isFeaturedReady: !!mappedList.length,
      skeletons: Array.from({ length: SKELETON_COUNT }, (_, index) => index),
    }
  }, [filters, searchList])

  const editCategory = (name: string) => {
    setFilters((prev) => ({ ...prev, activeCategory: name }))
  }

  const loadSearchList = () => {
    fetchSearchList.refetch()
  }

  useEffect(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getPayloads = () => {
      const category = HOME_CATEGORIES.find((item) => item.name === filters.activeCategory)
      return category ? [{ ...HOME_SEARCH_DEFAULTS, q: category.query }] : HOME_ALL_PAYLOADS
    }

    setGetSearchList(getPayloads())
  }, [filters.activeCategory, setGetSearchList])

  return (
    <>
      <HomeBanner watchHref={data.featuredHref} isWatchReady={data.isFeaturedReady} title="Indonesia hari ini, dalam video" />
      <section
        aria-label="Indonesia Hari Ini"
        className="flex w-full max-w-[1360px] flex-col gap-4 px-[clamp(16px,4vw,48px)] pb-10 pt-[clamp(22px,3.5vw,44px)] sm:gap-5"
      >
        <h2 className="m-0 font-display text-[clamp(24px,3.2vw,38px)] font-normal leading-none tracking-tight">Indonesia Hari Ini</h2>
        <HomeCategories tabs={data.tabs} onEditCategory={editCategory} />

        {data.isLoading ? (
          <div aria-busy="true" aria-label="Memuat video" className="grid grid-cols-[repeat(auto-fill,minmax(min(210px,100%),1fr))] gap-x-3.5 gap-y-7">
            {data.skeletons.map((index) => (
              <div key={index} className="flex flex-col gap-2.5">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : null}

        {data.isError ? (
          <div role="alert" className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="font-display text-xl">{data.errorTitle}</div>
            <p className="max-w-md text-sm text-muted-foreground">{data.errorSubtitle}</p>
            <Button type="button" variant="outline" onClick={loadSearchList} className="mt-3 h-10 rounded-xl px-5">
              <RotateCw />
              Coba lagi
            </Button>
          </div>
        ) : null}

        {data.isEmpty ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="font-display text-xl">{data.emptyTitle}</div>
            <p className="text-sm text-muted-foreground">{data.emptySubtitle}</p>
          </div>
        ) : null}

        {!data.isLoading && !data.isError && data.data.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(210px,100%),1fr))] gap-x-3.5 gap-y-7">
            {data.data.map((item, index) => (
              <HomeCard key={item.id} item={item} isPriority={index < PRIORITY_CARDS} />
            ))}
          </div>
        ) : null}
      </section>
    </>
  )
}
