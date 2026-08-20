'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, Clock, MapPin, Ticket, Users, Video } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  formId: string
  title: string
  description: string
  bannerUrl: string
  meetingUrl: string
  respondentName: string
  dateText: string
  sessionText: string
  totalAttendee: number
}

export default function ResponsesEvent({
  formId,
  title,
  description,
  bannerUrl,
  meetingUrl,
  respondentName,
  dateText,
  sessionText,
  totalAttendee,
}: Props) {
  const data = useMemo(() => {
    // Baris detail baru dirender kalau datanya memang ada, jadi form acara
    // tanpa field tanggal atau sesi tidak menyisakan kolom kosong.
    const getDetailList = () => [
      { key: 'tanggal', icon: CalendarDays, label: 'TANGGAL', value: dateText },
      { key: 'sesi', icon: Clock, label: 'SESI', value: sessionText },
      {
        key: 'lokasi',
        icon: MapPin,
        label: 'LOKASI',
        value: meetingUrl ? 'Google Meet — online' : '',
      },
    ]

    return {
      data: getDetailList().filter((item) => !!item.value),
      isLoading: false,
      isError: false,
      isEmpty: false,
      emptyTitle: '',
      emptySubtitle: '',
      emptyImage: '/no-data.svg',
      pagination: { currentPage: 1, perPage: 0 },
      title,
      description,
      bannerUrl,
      meetingUrl,
      attendeeText: `${String(totalAttendee).padStart(2, '0')} TERDAFTAR`,
      ticketName: respondentName.trim() || 'Peserta',
    }
  }, [
    title,
    description,
    bannerUrl,
    meetingUrl,
    respondentName,
    dateText,
    sessionText,
    totalAttendee,
  ])

  return (
    <div className="border-2 border-foreground">
      {data.bannerUrl ? (
        <div className="border-b-2 border-foreground bg-muted">
          <Image
            src={data.bannerUrl}
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
            <Ticket className="h-3.5 w-3.5" /> KAMU TERDAFTAR
          </span>
          <span aria-hidden className="brutal-hatch hidden flex-1 opacity-30 sm:block" />
          <span className="brutal-eyebrow flex items-center gap-2">
            <Users className="h-3.5 w-3.5" /> {data.attendeeText}
          </span>
        </div>

        <h1 className="mt-6 break-words font-display text-[clamp(1.9rem,5.5vw,3.25rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
          {data.title}
        </h1>

        <p className="mt-5 font-mono text-sm leading-relaxed">
          Atas nama <span className="font-bold">{data.ticketName}</span>. Simpan
          halaman ini sebagai bukti pendaftaranmu.
        </p>
      </div>

      {data.data.length ? (
        <dl className="grid border-b-2 border-foreground bg-paper sm:grid-cols-3">
          {data.data.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.key}
                className="border-b-2 border-foreground px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r-2 sm:last:border-r-0 sm:px-7"
              >
                <dt className="brutal-eyebrow flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" /> {item.label}
                </dt>
                <dd className="mt-2.5 break-words font-display text-lg font-black uppercase leading-tight tracking-tight">
                  {item.value}
                </dd>
              </div>
            )
          })}
        </dl>
      ) : null}

      {data.meetingUrl ? (
        <div className="border-b-2 border-foreground bg-foreground px-5 py-6 text-background sm:px-7">
          <p className="brutal-eyebrow opacity-70">LINK ACARA</p>
          <a
            href={data.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center gap-2.5 break-all font-mono text-sm underline underline-offset-4"
          >
            <Video className="h-4 w-4 shrink-0" />
            {data.meetingUrl}
          </a>
          <p className="mt-3 font-mono text-xs leading-relaxed opacity-70">
            Simpan link ini. Kamu bisa langsung bergabung saat acara dimulai.
          </p>
        </div>
      ) : null}

      {data.description ? (
        <div className="border-b-2 border-foreground bg-paper px-5 py-6 sm:px-7">
          <p className="brutal-eyebrow text-muted-foreground">TENTANG ACARA</p>
          <p className="mt-4 whitespace-pre-line break-words font-mono text-sm leading-relaxed">
            {data.description}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-5 bg-paper px-5 py-7 sm:px-7">
        {data.meetingUrl ? (
          <Button asChild size="lg">
            <a href={data.meetingUrl} target="_blank" rel="noreferrer">
              <Video /> Gabung Sekarang
            </a>
          </Button>
        ) : null}
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
