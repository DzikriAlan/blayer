'use client'

import { useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ExternalLink, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { DataSearch } from '@/features/search/types/searchTypes'
import { useSearchStates } from '@/features/search/states/searchStates'
import { useSearchControllers } from '@/features/search/controllers/searchControllers'
import { useVideoStates } from '@/features/video/states/videoStates'
import { useVideoControllers } from '@/features/video/controllers/videoControllers'
import { getCompactCount, getDurationLabel, getPublishedLabel } from '@/shared/lib/videoFormat'
import { useAutoplayNext } from '@/shared/lib/watchPreferences'
import HomeWatchDetail from './homeWatchDetail'
import HomeWatchPlayer from './homeWatchPlayer'
import HomeWatchUpNext from './homeWatchUpNext'
import type { HomeWatchUpNextItem } from './homeWatchUpNext'

interface Props {
  videoId: string
}

const UP_NEXT_COUNT = 10

export default function HomeWatch({ videoId }: Props) {
  const { video, setGetVideo } = useVideoStates()
  const { searchList } = useSearchStates()
  const { fetchVideo } = useVideoControllers()
  // "Berikutnya" memakai video beranda yang sudah tersimpan di localStorage
  useSearchControllers()
  const router = useRouter()
  const isAutoplayNext = useAutoplayNext()

  const data = useMemo(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getUpNextItem = (item: DataSearch): HomeWatchUpNextItem => ({
      id: item.id,
      href: `/watch/${item.id}`,
      title: item.title,
      channel: item.channel,
      meta: [item.views ? `${getCompactCount(item.views)} ditonton` : '', getPublishedLabel(item.publishedAt)].filter(Boolean).join(' · '),
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
      // Satu keadaan untuk area video: memuat, diputar di Blayer, atau hanya bisa di YouTube
      playerMode: (() => {
        if (!current) return 'loading'
        return current.embeddable === false ? 'blocked' : 'player'
      })(),
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

  // Video selesai: kalau putar otomatis aktif, lanjut ke video pertama di daftar "Berikutnya"
  const submitEnded = () => {
    const next = data.upNext[0]
    if (isAutoplayNext && next) router.push(next.href)
  }

  useEffect(() => {
    setGetVideo({ id: videoId })
  }, [videoId, setGetVideo])

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
        {data.video && data.playerMode === 'player' ? (
          <HomeWatchPlayer key={data.video.id} videoId={data.video.id} embedUrl={data.video.embedUrl} title={data.video.title} onEnded={submitEnded} />
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black sm:rounded-2xl">
            {data.playerMode === 'loading' ? <Skeleton className="absolute inset-0 rounded-none" /> : null}
            {data.video && data.playerMode === 'blocked' ? (
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
        )}

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
