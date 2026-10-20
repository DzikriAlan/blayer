'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, Pause, Play, Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { HOME_VIDEOS, getHomePhoto } from './homeCatalog'
import type { HomeVideo } from './homeCatalog'

interface Props {
  videoId: string
}

export default function HomeWatch({ videoId }: Props) {
  const [filters, setFilters] = useState({
    isPlaying: true,
    isFollowed: false,
  })

  const data = useMemo(() => {
    const getVideo = (id: string) => HOME_VIDEOS.find((video) => video.id === id)
    const getUpNextItem = (video: HomeVideo) => ({
      id: video.id,
      href: `/watch/${video.id}`,
      title: video.title,
      channel: video.channel,
      meta: `${video.views} ditonton · ${video.ago}`,
      duration: video.duration,
      imageSrc: getHomePhoto(video.photoId, 400),
    })

    const video = getVideo(videoId)
    const upNext = HOME_VIDEOS.filter((item) => item.id !== videoId).slice(0, 7).map(getUpNextItem)

    return {
      video,
      upNext,
      initial: video ? video.channel.charAt(0) : '',
      imageSrc: video ? getHomePhoto(video.photoId, 1400) : '',
      isEmpty: !video,
      emptyTitle: 'Video Tidak Ditemukan',
      emptySubtitle: 'Video yang kamu cari tidak ada atau sudah dihapus.',
      emptyImage: '/no-data.svg',
      isPlaying: filters.isPlaying,
      playLabel: filters.isPlaying ? 'Jeda' : 'Putar',
      followLabel: filters.isFollowed ? 'Mengikuti' : 'Ikuti',
      isFollowed: filters.isFollowed,
    }
  }, [videoId, filters])

  const editPlayback = () => {
    setFilters((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const editFollow = () => {
    setFilters((prev) => ({ ...prev, isFollowed: !prev.isFollowed }))
  }

  if (!data.video) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-24 text-center">
        <div className="font-display text-2xl">{data.emptyTitle}</div>
        <p className="text-sm text-muted-foreground">{data.emptySubtitle}</p>
        <Button asChild className="mt-4 h-11 rounded-xl px-6">
          <Link href="/">Kembali ke beranda</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-[1360px] flex-wrap items-start gap-8 px-[clamp(16px,4vw,48px)] pb-10 pt-2">
      <div className="flex min-w-[min(520px,100%)] flex-[3_1_520px] flex-col gap-5">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
          <Image src={data.imageSrc} alt="" fill priority unoptimized sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,12,0.7)] to-transparent to-50%" />
          <span className="absolute left-3 top-3 rounded-lg border border-white/20 bg-white/15 px-3.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur-md sm:left-5 sm:top-5">
            {data.video.category}
          </span>
          {data.isPlaying ? null : (
            <button
              type="button"
              aria-label="Putar"
              onClick={editPlayback}
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[20px] bg-primary text-primary-foreground sm:h-20 sm:w-20"
            >
              <Play className="h-7 w-7 fill-current" />
            </button>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 rounded-xl border border-white/20 bg-black/40 px-3 py-2.5 backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5 sm:gap-3.5 sm:px-4">
            <button
              type="button"
              aria-label={data.playLabel}
              onClick={editPlayback}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            >
              {data.isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            </button>
            <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-[3px] bg-white/30">
              <div
                key={videoId}
                className="h-full bg-primary"
                style={{
                  animation: 'watch-progress 90s linear forwards',
                  animationPlayState: data.isPlaying ? 'running' : 'paused',
                }}
              />
            </div>
            <span className="text-xs font-semibold text-white">{data.video.duration}</span>
          </div>
        </div>

        <h1 className="wrap-any m-0 font-display text-[clamp(22px,2.6vw,32px)] font-normal leading-tight tracking-tight">
          {data.video.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-xl text-primary-foreground">
              {data.initial}
            </span>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold">{data.video.channel}</span>
              <span className="text-[13px] text-muted-foreground">{data.video.views} ditonton · {data.video.ago}</span>
            </div>
            <Button
              type="button"
              variant={data.isFollowed ? 'outline' : 'primary'}
              aria-pressed={data.isFollowed}
              onClick={editFollow}
              className="ml-2 h-11 rounded-xl px-5 font-semibold"
            >
              {data.followLabel}
            </Button>
          </div>
          <div className="flex gap-2.5">
            <Button type="button" variant="outline" className="h-11 rounded-xl px-5 font-semibold">
              <Bookmark />
              Simpan
            </Button>
            <Button type="button" variant="outline" className="h-11 rounded-xl px-5 font-semibold">
              <Share2 />
              Bagikan
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-muted p-5">
          <h2 className="m-0 font-display text-lg font-medium">Tentang karya ini</h2>
          <p className="m-0 text-sm leading-relaxed text-muted-foreground">{data.video.description}</p>
        </div>
      </div>

      <aside aria-label="Berikutnya" className="flex min-w-[min(300px,100%)] flex-[1_1_300px] flex-col gap-4">
        <h2 className="m-0 font-display text-xl font-normal">Berikutnya</h2>
        {data.upNext.map((item) => (
          <Link key={item.id} href={item.href} className="flex gap-3">
            <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-40">
              <Image src={item.imageSrc} alt="" fill unoptimized loading="lazy" sizes="160px" className="object-cover" />
              <span className="absolute bottom-1 right-1 rounded bg-[rgba(11,11,13,0.82)] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                {item.duration}
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="wrap-any line-clamp-2 text-sm font-medium leading-snug">{item.title}</div>
              <div className="text-[13px] text-muted-foreground">{item.channel}</div>
              <div className="text-xs text-muted-foreground">{item.meta}</div>
            </div>
          </Link>
        ))}
      </aside>
    </div>
  )
}
