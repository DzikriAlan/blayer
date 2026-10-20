'use client'

import { useMemo, useState } from 'react'

import HomeBanner from './homeBanner'
import HomeCard from './homeCard'
import type { HomeCardItem } from './homeCard'
import HomeCategories from './homeCategories'
import {
  HOME_ALL_CATEGORY,
  HOME_CATEGORIES,
  HOME_FEATURED_ID,
  HOME_HERO_PHOTO_ID,
  HOME_VIDEOS,
  getHomePhoto,
} from './homeCatalog'
import type { HomeVideo } from './homeCatalog'

export default function HomeList() {
  const [filters, setFilters] = useState({
    activeCategory: HOME_ALL_CATEGORY,
  })

  const data = useMemo(() => {
    const getMappedItem = (video: HomeVideo): HomeCardItem => ({
      id: video.id,
      href: `/watch/${video.id}`,
      title: video.title,
      channel: video.channel,
      meta: `${video.views} ditonton · ${video.ago}`,
      duration: video.duration,
      category: video.category,
      imageSrc: getHomePhoto(video.photoId, 600),
    })

    const isAll = filters.activeCategory === HOME_ALL_CATEGORY
    const filteredList = isAll
      ? HOME_VIDEOS
      : HOME_VIDEOS.filter((video) => video.category === filters.activeCategory)
    const mappedList = filteredList.map(getMappedItem)
    const tabs = [HOME_ALL_CATEGORY, ...HOME_CATEGORIES].map((name) => ({
      name,
      isActive: name === filters.activeCategory,
    }))

    return {
      data: mappedList,
      tabs,
      isLoading: false,
      isError: false,
      isEmpty: !mappedList.length,
      emptyTitle: 'Video Tidak Ditemukan',
      emptySubtitle: 'Belum ada video untuk kategori ini. Coba kategori lain.',
      emptyImage: '/no-data.svg',
      heroSrc: getHomePhoto(HOME_HERO_PHOTO_ID, 2000),
      featuredHref: `/watch/${HOME_FEATURED_ID}`,
    }
  }, [filters])

  const editCategory = (name: string) => {
    setFilters((prev) => ({ ...prev, activeCategory: name }))
  }

  return (
    <>
      <HomeBanner
        imageSrc={data.heroSrc}
        watchHref={data.featuredHref}
        title="Indonesia hari ini, dalam video"
        subtitle="Politik, ekonomi, investasi, psikologi, dan pengembangan diri."
      />
      <section
        aria-label="Indonesia Hari Ini"
        className="flex w-full max-w-[1360px] flex-col gap-[clamp(18px,2.4vw,28px)] px-[clamp(16px,4vw,48px)] pb-10 pt-[clamp(28px,4vw,48px)]"
      >
        <h2 className="m-0 font-display text-[clamp(26px,3.2vw,38px)] font-normal leading-none tracking-tight">
          Indonesia Hari Ini
        </h2>
        <HomeCategories tabs={data.tabs} onEditCategory={editCategory} />
        {data.isEmpty ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="font-display text-xl">{data.emptyTitle}</div>
            <p className="text-sm text-muted-foreground">{data.emptySubtitle}</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(210px,100%),1fr))] gap-x-3.5 gap-y-7">
            {data.data.map((item) => (
              <HomeCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
