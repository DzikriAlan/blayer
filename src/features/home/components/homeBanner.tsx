import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'

import ThemeToggle from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import bannerImage from '@/shared/images/Semua Mata pada Karhutla.png'

interface Props {
  watchHref: string
  title: string
  isWatchReady: boolean
}

// Gambar banner sudah membawa pesannya sendiri, jadi judul halaman hanya dibaca pembaca layar
export default function HomeBanner({ watchHref, title, isWatchReady }: Props) {
  return (
    <section aria-label="Banner" className="w-full max-w-[1360px] px-[clamp(12px,4vw,48px)] pt-3 sm:pt-4">
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl bg-[#140a06] sm:aspect-[4/1] sm:rounded-3xl">
        <Image
          src={bannerImage}
          alt="All Eyes on Karhutla. Hutan bukan cuma pohon, tapi masa depan. Indonesia bisa lebih baik."
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-left sm:object-[50%_40%]"
        />
        <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-[clamp(12px,2.4vw,32px)] pt-2.5 sm:pt-4">
          <Link href="/" aria-label="Blayer, ke beranda" className="font-display text-[26px] font-normal leading-none tracking-tight text-white sm:text-[30px]">
            blayer
          </Link>
          <ThemeToggle className="text-white hover:bg-white/15" />
        </div>

        <h1 className="sr-only">{title}</h1>

        {isWatchReady ? (
          <Button
            asChild
            className="absolute bottom-2.5 right-2.5 h-9 rounded-xl px-3.5 text-[13px] shadow-lg sm:bottom-5 sm:right-5 sm:h-11 sm:px-5 sm:text-[14px]"
          >
            <Link href={watchHref}>
              <Play className="fill-current" />
              <span>Mulai menonton</span>
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  )
}
