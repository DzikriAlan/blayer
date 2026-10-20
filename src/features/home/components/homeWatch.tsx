'use client'

import { useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { DataSearch } from '@/features/search/types/searchTypes'
import { useSearchStates } from '@/features/search/states/searchStates'
import { useSearchControllers } from '@/features/search/controllers/searchControllers'
import { useVideoStates } from '@/features/video/states/videoStates'
import { useVideoControllers } from '@/features/video/controllers/videoControllers'
import { getCompactCount, getDurationLabel } from '@/shared/lib/videoFormat'
import { HOME_ALL_PAYLOADS } from './homeCatalog'
import HomeWatchDetail from './homeWatchDetail'
import HomeWatchUpNext from './homeWatchUpNext'
import type { HomeWatchUpNextItem } from './homeWatchUpNext'

interface Props {
  videoId: string
}

const UP_NEXT_COUNT = 10

export default function HomeWatch({ videoId }: Props) {
  const { video, setGetVideo } = useVideoStates()
  const { searchList, setGetSearchList } = useSearchStates()
  const { fetchVideo } = useVideoControllers()
  useSearchControllers()

  const data = useMemo(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getUpNextItem = (item: DataSearch): HomeWatchUpNextItem => ({
      id: item.id,
      href: `/watch/${item.id}`,
      title: item.title,
      channel: item.channel,
      meta: [item.views ? `${getCompactCount(item.views)} ditonton` : '', item.published].filter(Boolean).join(' · '),
      duration: item.isLive ? 'LIVE' : getDurationLabel(item.duration),
      imageSrc: item.thumbnail,
    })

    const current = video.data?.id === videoId ? video.data : null
    const seen = new Set<string>([videoId])
    const upNext = searchList.data
      .flatMap((group) => group.items)
      .filter((item) => !seen.has(item.id) && seen.add(item.id))
      .slice(0, UP_NEXT_COUNT)
      .map(getUpNextItem)

    return {
      video: current,
      // Klik kartu di Blayer adalah gestur pengguna, jadi browser mengizinkan video langsung diputar
      embedSrc: current ? `${current.embedUrl}?autoplay=1&playsinline=1&rel=0&modestbranding=1` : '',
      isEmbeddable: current?.embeddable !== false,
      upNext,
      isUpNextLoading: searchList.status === 'loading',
      isLoading: video.status === 'loading' || (!!video.data && !current),
      isError: video.status === 'error',
      isEmpty: video.status === 'empty',
      emptyTitle: video.statusTitle,
      emptySubtitle: video.statusSubtitle,
      emptyImage: '/no-data.svg',
    }
  }, [video, videoId, searchList])

  const loadVideo = () => {
    fetchVideo.refetch()
  }

  useEffect(() => {
    setGetVideo({ id: videoId })
  }, [videoId, setGetVideo])

  // "Berikutnya" memakai hasil pencarian beranda, yang biasanya sudah ada di localStorage
  useEffect(() => {
    setGetSearchList(HOME_ALL_PAYLOADS)
  }, [setGetSearchList])

  if (data.isEmpty || data.isError) {
    return (
      <div role={data.isError ? 'alert' : undefined} className="flex flex-col items-center gap-2 px-4 py-24 text-center">
        <div className="font-display text-2xl">{data.isError ? 'Video gagal dimuat' : data.emptyTitle}</div>
        <p className="max-w-md text-sm text-muted-foreground">{data.emptySubtitle}</p>
        <div className="mt-4 flex gap-2">
          {data.isError ? (
            <Button type="button" variant="outline" onClick={loadVideo} className="h-11 rounded-xl px-5">
              <RotateCw />
              Coba lagi
            </Button>
          ) : null}
          <Button asChild className="h-11 rounded-xl px-6">
            <Link href="/">Kembali ke beranda</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-[1360px] flex-col gap-8 px-[clamp(12px,4vw,48px)] pb-10 pt-1 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black sm:rounded-2xl">
          {data.isLoading ? <Skeleton className="absolute inset-0 rounded-none" /> : null}
          {data.video && data.isEmbeddable ? (
            <iframe
              key={data.video.id}
              src={data.embedSrc}
              title={data.video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : null}
          {data.video && !data.isEmbeddable ? (
            <>
              <Image src={data.video.thumbnail} alt="" fill unoptimized sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center text-white">
                <p className="m-0 text-sm">Pemilik video tidak mengizinkan video ini diputar di luar YouTube.</p>
                <Button asChild className="h-10 rounded-xl px-5">
                  <a href={data.video.url} target="_blank" rel="noreferrer">
                    <ExternalLink />
                    Tonton di YouTube
                  </a>
                </Button>
              </div>
            </>
          ) : null}
        </div>

        {data.isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-11 w-2/3" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : null}

        {data.video ? (
          <>
            <h1 className="wrap-any m-0 font-display text-[clamp(20px,2.4vw,30px)] font-normal leading-tight tracking-tight">{data.video.title}</h1>
            <HomeWatchDetail key={data.video.id} video={data.video} />
          </>
        ) : null}
      </div>

      <HomeWatchUpNext items={data.upNext} isLoading={data.isUpNextLoading} />
    </div>
  )
}
