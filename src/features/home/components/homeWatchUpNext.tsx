import Image from 'next/image'
import Link from 'next/link'

import { Skeleton } from '@/components/ui/skeleton'

export interface HomeWatchUpNextItem {
  id: string
  href: string
  title: string
  channel: string
  meta: string
  duration: string
  imageSrc: string
}

interface Props {
  items: HomeWatchUpNextItem[]
  isLoading: boolean
}

export default function HomeWatchUpNext({ items, isLoading }: Props) {
  return (
    <aside aria-label="Berikutnya" className="flex w-full flex-col gap-4 lg:w-[360px] lg:shrink-0">
      <h2 className="m-0 font-display text-xl font-normal">Berikutnya</h2>
      {isLoading
        ? Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="aspect-video w-36 shrink-0 rounded-lg sm:w-40" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))
        : null}
      {items.map((item) => (
        <Link key={item.id} href={item.href} className="group flex gap-3">
          <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-40">
            <Image src={item.imageSrc} alt="" fill unoptimized loading="lazy" sizes="160px" className="object-cover" />
            {item.duration ? (
              <span className="absolute bottom-1 right-1 rounded bg-[rgba(11,11,13,0.82)] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                {item.duration}
              </span>
            ) : null}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="wrap-any line-clamp-2 text-sm font-medium leading-snug group-hover:underline">{item.title}</div>
            <div className="truncate text-[13px] text-muted-foreground">{item.channel}</div>
            <div className="text-xs text-muted-foreground">{item.meta}</div>
          </div>
        </Link>
      ))}
    </aside>
  )
}
