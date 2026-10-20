import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'

import AccountDialog from '@/components/account-dialog'
import { Button } from '@/components/ui/button'

interface Props {
  imageSrc: string
  watchHref: string
  title: string
  subtitle: string
}

export default function HomeBanner({ imageSrc, watchHref, title, subtitle }: Props) {
  return (
    <section aria-label="Banner" className="w-full px-3 pt-3">
      <div className="relative flex min-h-[320px] flex-col justify-between gap-7 overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#0F1626_0%,#2A2232_55%,#5C2E17_100%)] px-[clamp(18px,4vw,48px)] pb-6 pt-4 text-white sm:min-h-[340px] sm:gap-9 sm:pb-8 sm:pt-5">
        <Image src={imageSrc} alt="" fill priority unoptimized sizes="100vw" className="object-cover" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,12,0.82)_0%,rgba(8,8,12,0.52)_60%,rgba(8,8,12,0.3)_100%),linear-gradient(0deg,rgba(255,110,20,0.3),transparent_45%)]"
        />
        <div className="relative flex items-center justify-between gap-3">
          <Link href="/" aria-label="Blayer, ke beranda" className="font-display text-[30px] font-normal leading-none tracking-tight">
            blayer
          </Link>
          <AccountDialog />
        </div>
        <div className="relative flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div className="flex min-w-0 max-w-[560px] flex-col gap-3">
            <h1 className="wrap-any m-0 font-display text-[clamp(30px,4.6vw,52px)] font-normal leading-[1.04] tracking-tight text-white">
              {title}
            </h1>
            <p className="m-0 text-[clamp(15px,1.5vw,17px)] leading-relaxed text-white/90">{subtitle}</p>
          </div>
          <Button asChild size="lg" className="h-[52px] w-full rounded-xl px-7 sm:w-auto">
            <Link href={watchHref}>
              <Play className="fill-current" />
              <span>Mulai menonton</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
