import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, Play } from 'lucide-react'

export interface HomeCardItem {
  id: string
  href: string
  title: string
  channel: string
  isVerified: boolean
  meta: string
  duration: string
  category: string
  imageSrc: string
}

interface Props {
  item: HomeCardItem
  isPriority?: boolean
}

export default function HomeCard({ item, isPriority = false }: Props) {
  return (
    <Link href={item.href} className="group flex min-w-0 flex-col gap-2.5">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
        <Image
          src={item.imageSrc}
          alt=""
          fill
          unoptimized
          loading={isPriority ? 'eager' : 'lazy'}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,12,0.6)] to-transparent to-55%" />
        <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-primary text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:opacity-100">
          <Play className="h-[18px] w-[18px] fill-current" />
        </div>
        {item.category ? (
          <span className="absolute bottom-2 left-2 rounded-md border border-white/25 bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
            {item.category}
          </span>
        ) : null}
        {item.duration ? (
          <span className="absolute bottom-2 right-2 rounded-md bg-[rgba(11,11,13,0.82)] px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {item.duration}
          </span>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="wrap-any line-clamp-2 font-display text-[16px] font-medium leading-[1.3] tracking-tight sm:text-[17px]">{item.title}</div>
        <div className="flex min-w-0 items-center gap-1 text-sm font-medium text-muted-foreground">
          <span className="truncate">{item.channel}</span>
          {item.isVerified ? <BadgeCheck aria-label="Channel terverifikasi" className="h-3.5 w-3.5 shrink-0" /> : null}
        </div>
        <div className="wrap-any text-[13px] text-muted-foreground">{item.meta}</div>
      </div>
    </Link>
  )
}
