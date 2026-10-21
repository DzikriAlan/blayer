'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle, RotateCw } from 'lucide-react'

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
import { HOME_ALL_CATEGORY, HOME_ALL_PAYLOADS, HOME_CATEGORIES, HOME_MAX_AGE_HOURS } from './homeCatalog'

const SKELETON_COUNT = 8
// Kartu di baris pertama terlihat tanpa scroll, jadi gambarnya dimuat segera
const PRIORITY_CARDS = 4
// Beranda menampilkan 20 video dulu; 20 berikutnya dimuat saat pengguna menggulir mendekati bawah
const PAGE_SIZE = 20
// Jeda singkat agar skeleton "memuat" terlihat sebelum 20 video berikutnya muncul
const LOAD_MORE_DELAY_MS = 700

export default function HomeList() {
  const { searchList, setGetSearchList } = useSearchStates()
  const { fetchSearchList } = useSearchControllers()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [filters, setFilters] = useState({
    activeCategory: HOME_ALL_CATEGORY,
    visibleCount: PAGE_SIZE,
    isLoadingMore: false,
  })

  const data = useMemo(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getCategoryName = (key: string) => HOME_CATEGORIES.find((category) => category.key === key)?.name ?? ''

    const getMappedItem = (video: DataSearch, category: string): HomeCardItem => ({
      id: video.id,
      href: `/watch/${video.id}`,
      title: video.title,
      channel: video.channel,
      isVerified: video.verifiedChannel,
      isShort: video.isShort,
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
            items.push(getMappedItem(video, getCategoryName(group.key)))
          }
        }
      }
      return items
    }

    const mappedList = getInterleaved(searchList.data)
    // Tanpa IntersectionObserver (browser lama) semua video langsung ditampilkan
    const canLazyLoad = typeof window !== 'undefined' && 'IntersectionObserver' in window
    const visibleCount = canLazyLoad ? filters.visibleCount : mappedList.length
    const tabs = [HOME_ALL_CATEGORY, ...HOME_CATEGORIES.map((category) => category.name)].map((name) => ({
      name,
      isActive: name === filters.activeCategory,
    }))

    return {
      data: mappedList.slice(0, visibleCount),
      hasMore: mappedList.length > visibleCount,
      isLoadingMore: filters.isLoadingMore,
      loadMoreLabel: `Memuat ${Math.min(PAGE_SIZE, mappedList.length - visibleCount)} video berikutnya…`,
      tabs,
      countLabel: mappedList.length ? `${mappedList.length} video · ${HOME_MAX_AGE_HOURS} jam terakhir` : '',
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
    setFilters((prev) => ({ ...prev, activeCategory: name, visibleCount: PAGE_SIZE, isLoadingMore: false }))
  }

  const loadSearchList = () => {
    fetchSearchList.refetch()
  }

  useEffect(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getPayloads = () => {
      const category = HOME_CATEGORIES.find((item) => item.name === filters.activeCategory)
      return category ? [category.payload] : HOME_ALL_PAYLOADS
    }

    setGetSearchList(getPayloads())
  }, [filters.activeCategory, setGetSearchList])

  // Lazy load: saat skeleton di bawah masuk layar, tampilkan status memuat lalu 20 video berikutnya.
  // Skeleton memakai overflow-anchor:none agar browser tidak menahan scroll di situ dan memicu muatan beruntun.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!data.hasMore || data.isLoadingMore || !sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setFilters((prev) => ({ ...prev, isLoadingMore: true }))
      },
      { rootMargin: '0px 0px 120px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [data.hasMore, data.isLoadingMore, data.data.length])

  useEffect(() => {
    if (!data.isLoadingMore) return
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, visibleCount: prev.visibleCount + PAGE_SIZE, isLoadingMore: false }))
    }, LOAD_MORE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [data.isLoadingMore])

  return (
    <>
      <HomeBanner watchHref={data.featuredHref} isWatchReady={data.isFeaturedReady} title="Indonesia hari ini, dalam video" />
      <section
        aria-label="Indonesia Hari Ini"
        className="flex w-full max-w-[1360px] flex-col gap-4 px-[clamp(16px,4vw,48px)] pb-10 pt-[clamp(22px,3.5vw,44px)] sm:gap-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="m-0 font-display text-[clamp(24px,3.2vw,38px)] font-normal leading-none tracking-tight">Indonesia Hari Ini</h2>
          {data.countLabel && !data.isLoading ? <p className="m-0 text-[13px] text-muted-foreground">{data.countLabel}</p> : null}
        </div>
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

        {data.hasMore && !data.isLoading && !data.isError ? (
          <div ref={sentinelRef} className="flex flex-col gap-4 [overflow-anchor:none]">
            <div aria-hidden className="grid grid-cols-[repeat(auto-fill,minmax(min(210px,100%),1fr))] gap-x-3.5 gap-y-7">
              {data.skeletons.slice(0, 4).map((index) => (
                <div key={index} className="flex flex-col gap-2.5">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <Skeleton className="h-4 w-11/12" />
                </div>
              ))}
            </div>
            <p role="status" className="m-0 flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
              {data.isLoadingMore ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
              {data.isLoadingMore ? data.loadMoreLabel : 'Gulir untuk memuat video berikutnya'}
            </p>
          </div>
        ) : null}
      </section>
    </>
  )
}
