import { useMemo, useState } from 'react'
import Image from 'next/image'
import { BadgeCheck, Check, ExternalLink, Share2 } from 'lucide-react'

import MarkdownText from '@/components/markdown-text'
import { Button } from '@/components/ui/button'
import type { DataVideo } from '@/features/video/types/videoTypes'
import { getCompactCount, getFullCount, getPublishLabel, getSecondsLabel } from '@/shared/lib/videoFormat'

interface Props {
  video: DataVideo
}

// Deskripsi lebih panjang dari ini dipotong secara visual sampai pengguna menekan Selengkapnya
const DESCRIPTION_PREVIEW = 220

const getHashtagHref = (tag: string) => `https://www.youtube.com/hashtag/${encodeURIComponent(tag.toLowerCase())}`

export default function HomeWatchDetail({ video }: Props) {
  const [filters, setFilters] = useState({ isExpanded: false, isCopied: false })

  const data = useMemo(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getStats = () => {
      const stats = [
        video.isLiveNow
          ? { label: 'Sedang menonton', value: getFullCount(video.watchingNow) }
          : { label: 'Penonton', value: getFullCount(video.views) },
        { label: 'Suka', value: getFullCount(video.likes) },
        { label: 'Komentar', value: getFullCount(video.comments) },
        { label: 'Tayang', value: getPublishLabel(video.publishDate) },
      ]
      return stats.filter((stat) => stat.value)
    }

    const getMoreDetails = () =>
      [
        { label: 'Kategori', value: video.category },
        { label: 'Durasi', value: video.lengthSeconds ? getSecondsLabel(video.lengthSeconds) : '' },
        { label: 'Diunggah', value: getPublishLabel(video.uploadDate) },
        { label: 'Channel', value: `${video.channel.name} · ${video.channel.subscribersLabel}` },
      ].filter((item) => item.value)

    const getKeywordHref = (keyword: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`

    const description = video.description.trim()
    const isLong = description.length > DESCRIPTION_PREVIEW || video.keywords.length > 0

    return {
      initial: video.channel.name.charAt(0).toUpperCase(),
      subscribersLabel: video.channel.subscribers
        ? `${getCompactCount(video.channel.subscribers)} subscriber`
        : video.channel.subscribersLabel,
      stats: getStats(),
      moreDetails: getMoreDetails(),
      description,
      isClamped: !filters.isExpanded && description.length > DESCRIPTION_PREVIEW,
      hasDescription: !!description,
      isLong,
      isExpanded: filters.isExpanded,
      toggleLabel: filters.isExpanded ? 'Sembunyikan' : 'Selengkapnya',
      keywords: video.keywords.slice(0, 20).map((keyword) => ({ text: keyword, href: getKeywordHref(keyword) })),
      shareLabel: filters.isCopied ? 'Link tersalin' : 'Bagikan',
      isCopied: filters.isCopied,
    }
  }, [video, filters])

  const editDescription = () => {
    setFilters((prev) => ({ ...prev, isExpanded: !prev.isExpanded }))
  }

  const submitShare = async () => {
    // utilisasi wajib ditulis di dalam parent function
    const getShareUrl = () => window.location.href

    if (typeof navigator.share === 'function') {
      await navigator.share({ title: video.title, url: getShareUrl() }).catch(() => undefined)
      return
    }
    await navigator.clipboard?.writeText(getShareUrl())
    setFilters((prev) => ({ ...prev, isCopied: true }))
    setTimeout(() => setFilters((prev) => ({ ...prev, isCopied: false })), 1800)
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {video.channel.avatar ? (
            <Image
              src={video.channel.avatar}
              alt=""
              width={44}
              height={44}
              unoptimized
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl text-primary-foreground">
              {data.initial}
            </span>
          )}
          <div className="flex min-w-0 flex-col">
            <a
              href={video.channel.url}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center gap-1 text-[15px] font-semibold hover:underline"
            >
              <span className="truncate">{video.channel.name}</span>
              {video.channel.verified ? <BadgeCheck aria-label="Channel terverifikasi" className="h-4 w-4 shrink-0 text-muted-foreground" /> : null}
            </a>
            <span className="text-[13px] text-muted-foreground">{data.subscribersLabel}</span>
          </div>
          <Button asChild className="ml-auto h-10 shrink-0 rounded-full px-5 font-semibold sm:ml-3">
            <a href={video.channel.subscribeUrl} target="_blank" rel="noreferrer">
              Subscribe
            </a>
          </Button>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={submitShare} className="h-10 flex-1 rounded-full px-4 sm:flex-none">
            {data.isCopied ? <Check /> : <Share2 />}
            {data.shareLabel}
          </Button>
          <Button asChild variant="secondary" className="h-10 flex-1 rounded-full px-4 sm:flex-none">
            <a href={video.url} target="_blank" rel="noreferrer">
              <ExternalLink />
              YouTube
            </a>
          </Button>
        </div>
      </div>

      <section aria-label="Tentang video ini" className="flex flex-col gap-3 rounded-2xl bg-muted p-4 sm:p-5">
        <dl className="flex flex-wrap gap-x-5 gap-y-2">
          {data.stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-1.5">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="m-0 text-sm font-semibold tabular-nums">{stat.value}</dd>
              <span aria-hidden className="text-[13px] text-muted-foreground">{stat.label.toLowerCase()}</span>
            </div>
          ))}
        </dl>

        {data.hasDescription ? (
          <div className={data.isClamped ? 'relative max-h-[8.5rem] overflow-hidden' : undefined}>
            <MarkdownText text={data.description} getHashtagHref={getHashtagHref} className="text-foreground/90" />
            {data.isClamped ? (
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-muted to-transparent" />
            ) : null}
          </div>
        ) : (
          <p className="m-0 text-sm text-muted-foreground">Kreator tidak menulis deskripsi untuk video ini.</p>
        )}

        {data.isExpanded ? (
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {data.moreDetails.map((item) => (
                <div key={item.label} className="flex justify-between gap-3 text-sm sm:justify-start">
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="m-0 text-right font-medium sm:text-left">{item.value}</dd>
                </div>
              ))}
            </dl>
            {data.keywords.length ? (
              <ul aria-label="Kata kunci" className="flex flex-wrap gap-1.5">
                {data.keywords.map((keyword) => (
                  <li key={keyword.text}>
                    <a
                      href={keyword.href}
                      target="_blank"
                      rel="noreferrer nofollow"
                      className="block rounded-md bg-background px-2 py-1 text-xs text-blue-600 hover:underline dark:text-sky-400"
                    >
                      #{keyword.text}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {data.isLong ? (
          <button
            type="button"
            onClick={editDescription}
            aria-expanded={data.isExpanded}
            className="self-start text-sm font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {data.toggleLabel}
          </button>
        ) : null}
      </section>
    </>
  )
}
