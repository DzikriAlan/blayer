'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GraduationCap, PlayCircle, Wallet } from 'lucide-react'

import type { ResponsesOrderItem } from './responsesOrder'

import { Button } from '@/components/ui/button'

interface Props {
  formId: string
  title: string
  description: string
  image: string
  video: string
  name: string
  items: ResponsesOrderItem[]
  amount: number
  paymentMethod: string
}

export default function ResponsesCourse({
  formId,
  title,
  description,
  image,
  video,
  name,
  items,
  amount,
  paymentMethod,
}: Props) {
  const data = useMemo(() => {
    const getCurrencyText = (value: number) =>
      `Rp${value.toLocaleString('id-ID')}`

    const getEmbedUrl = () => {
      const raw = video.trim()
      if (!raw) return ''

      const getYoutubeId = () => {
        const shortMatch = raw.match(/youtu\.be\/([\w-]{6,})/)
        if (shortMatch) return shortMatch[1]
        const longMatch = raw.match(/[?&]v=([\w-]{6,})/)
        if (longMatch) return longMatch[1]
        const embedMatch = raw.match(/youtube\.com\/embed\/([\w-]{6,})/)
        return embedMatch ? embedMatch[1] : ''
      }

      const videoId = getYoutubeId()
      return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
    }

    const getMappedItem = (item: ResponsesOrderItem) => ({
      name: item.name,
      qtyText: `${String(item.qty).padStart(2, '0')} × ${getCurrencyText(item.price)}`,
      subtotalText: getCurrencyText(item.subtotal),
    })

    const mappedList = items.map((raw) => getMappedItem(raw))

    return {
      data: mappedList,
      isLoading: false,
      isError: false,
      isEmpty: !mappedList.length,
      emptyTitle: 'Tanpa Paket',
      emptySubtitle: 'Pendaftaran ini tersimpan tanpa paket kelas.',
      emptyImage: '/no-data.svg',
      pagination: { currentPage: 1, perPage: mappedList.length },
      title,
      description,
      image,
      video: video.trim(),
      embedUrl: getEmbedUrl(),
      hasVideo: !!video.trim(),
      amountText: getCurrencyText(amount),
      paymentMethod: paymentMethod || 'Belum dipilih',
      studentName: name.trim() || 'Peserta',
    }
  }, [
    title,
    description,
    image,
    video,
    name,
    items,
    amount,
    paymentMethod,
  ])

  return (
    <div className="border-2 border-foreground">
      {data.image ? (
        <div className="border-b-2 border-foreground bg-muted">
          <Image
            src={data.image}
            alt={`Banner ${data.title}`}
            width={0}
            height={0}
            unoptimized
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            className="h-auto w-full"
          />
        </div>
      ) : null}

      <div className="border-b-2 border-foreground bg-primary px-5 py-9 text-primary-foreground sm:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="brutal-eyebrow flex items-center gap-2 bg-foreground px-3 py-2 text-primary">
            <GraduationCap className="h-3.5 w-3.5" /> KELAS TERBUKA
          </span>
          <span
            aria-hidden
            className="brutal-hatch hidden flex-1 opacity-30 sm:block"
          />
          <span className="brutal-eyebrow">{data.amountText}</span>
        </div>

        <h1 className="mt-6 break-words font-display text-[clamp(1.9rem,5.5vw,3.25rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
          {data.title}
        </h1>

        <p className="mt-5 font-mono text-sm leading-relaxed">
          Atas nama <span className="font-bold">{data.studentName}</span>. Simpan
          halaman ini — materi kelas ada di bawah.
        </p>
      </div>

      {data.embedUrl ? (
        <div className="border-b-2 border-foreground bg-foreground">
          <div className="relative w-full pb-[56.25%]">
            <iframe
              src={data.embedUrl}
              title={`Video materi ${data.title}`}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      ) : null}

      {data.hasVideo && !data.embedUrl ? (
        <div className="border-b-2 border-foreground bg-foreground px-5 py-6 text-background sm:px-7">
          <p className="brutal-eyebrow opacity-70">VIDEO MATERI</p>
          <a
            href={data.video}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center gap-2.5 break-all font-mono text-sm underline underline-offset-4"
          >
            <PlayCircle className="h-4 w-4 shrink-0" />
            {data.video}
          </a>
        </div>
      ) : null}

      {!data.hasVideo ? (
        <div className="border-b-2 border-foreground bg-muted px-5 py-6 sm:px-7">
          <p className="brutal-eyebrow text-muted-foreground">VIDEO MATERI</p>
          <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
            Pengajar belum mencantumkan tautan videonya. Pendaftaran dan
            pembayaranmu tetap tercatat — hubungi pengajar untuk akses materi.
          </p>
        </div>
      ) : null}

      {data.isEmpty ? null : (
        <ul className="border-b-2 border-foreground bg-paper">
          {data.data.map((item) => (
            <li
              key={item.name}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-foreground px-5 py-4 last:border-b-0 sm:px-7"
            >
              <span className="min-w-0 break-words font-display text-base font-black uppercase leading-tight tracking-tight">
                {item.name}
              </span>
              <span className="brutal-eyebrow text-muted-foreground">
                {item.qtyText}
              </span>
              <span className="brutal-eyebrow shrink-0">
                {item.subtotalText}
              </span>
            </li>
          ))}
        </ul>
      )}

      <dl className="grid border-b-2 border-foreground bg-paper sm:grid-cols-2">
        <div className="border-b-2 border-foreground px-5 py-5 sm:border-b-0 sm:border-r-2 sm:px-7">
          <dt className="brutal-eyebrow flex items-center gap-2 text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" /> METODE PEMBAYARAN
          </dt>
          <dd className="mt-2.5 break-words font-display text-lg font-black uppercase leading-tight tracking-tight">
            {data.paymentMethod}
          </dd>
        </div>
        <div className="px-5 py-5 sm:px-7">
          <dt className="brutal-eyebrow text-muted-foreground">TOTAL DIBAYAR</dt>
          <dd className="mt-2.5 font-display text-3xl font-black leading-none">
            {data.amountText}
          </dd>
        </div>
      </dl>

      {data.description ? (
        <div className="border-b-2 border-foreground bg-paper px-5 py-6 sm:px-7">
          <p className="brutal-eyebrow text-muted-foreground">TENTANG KELAS</p>
          <p className="mt-4 whitespace-pre-line break-words font-mono text-sm leading-relaxed">
            {data.description}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-5 bg-paper px-5 py-7 sm:px-7">
        <Button asChild variant="outline" size="sm">
          <Link href={`/forms/${formId}/result`}>Lihat Daftar Peserta</Link>
        </Button>
        <Button asChild variant="danger" size="sm">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  )
}
