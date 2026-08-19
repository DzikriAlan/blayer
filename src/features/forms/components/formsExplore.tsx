'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowUpRight, Sparkles, Users } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadData } from '@/shared/components/load-data'
import type { DataFormsPublic } from '../types/formsTypes'
import { useFormsStates } from '../states/formsStates'
import { useFormsControllers } from '../controllers/formsControllers'
import {
  FORMS_TEMPLATES,
  FORMS_TEMPLATE_DEFAULT_VIEW,
  type FormsTemplateView,
} from './formsTemplate'

/**
 * Bentuk sajian tiap kategori.
 *
 * Diturunkan dari `view` yang sama dengan yang sudah menentukan halaman isi,
 * layar setelah kirim, dan dashboard hasil — jadi menambah template baru tidak
 * menuntut komponen baru di sini.
 *
 * | view      | bentuk   | alasan                                              |
 * | --------- | -------- | --------------------------------------------------- |
 * | `event`   | `poster` | acara dijual lewat posternya, bukan lewat judul saja |
 * | `course`  | `poster` | katalog kelas selalu memajang sampul dan harga       |
 * | `order`   | `menu`   | menu dibaca sekilas dan berdampingan, bukan berderet |
 * | lainnya   | `list`   | ujian dan survei dibaca berurutan seperti daftar     |
 */
const getLayout = (view: FormsTemplateView) => {
  if (view === 'event' || view === 'course') return 'poster'
  if (view === 'order') return 'menu'
  return 'list'
}

const VIEW_ACTION: Record<FormsTemplateView, string> = {
  exam: 'Kerjakan Ujian',
  scoring: 'Isi Form',
  survey: 'Isi Survei',
  event: 'Daftar Acara',
  order: 'Pesan Sekarang',
  course: 'Ikut Kelas',
}

/** Satuan yang benar untuk tiap kategori — "responses" tidak berarti apa-apa. */
const VIEW_COUNT_LABEL: Record<FormsTemplateView, string> = {
  exam: 'PESERTA',
  scoring: 'PESERTA',
  survey: 'RESPONDEN',
  event: 'TERDAFTAR',
  order: 'PESANAN',
  course: 'PESERTA',
}

const VIEW_FIELD_LABEL: Record<FormsTemplateView, string> = {
  exam: 'SOAL',
  scoring: 'PERTANYAAN',
  survey: 'PERTANYAAN',
  event: 'ISIAN',
  order: 'PILIHAN',
  course: 'ISIAN',
}

const getPriceText = (amount: number) =>
  amount > 0
    ? `Rp${new Intl.NumberFormat('id-ID').format(amount)}`
    : 'Gratis'

interface Props {
  templateId: string
}

export default function FormsExplore({ templateId }: Props) {
  const { formsPublic } = useFormsStates()
  const { fetchFormsPublic } = useFormsControllers()

  const data = useMemo(() => {
    const template = FORMS_TEMPLATES.find((item) => item.id === templateId)
    const view = template?.view ?? FORMS_TEMPLATE_DEFAULT_VIEW

    const getMappedForm = (item: DataFormsPublic) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      bannerUrl: item.bannerUrl,
      priceText: getPriceText(item.priceAmount),
      isPaid: item.priceAmount > 0,
      totalField: item.totalField,
      totalResponse: item.totalResponse,
    })

    const mappedList = formsPublic.data
      .filter((raw) => raw.templateId === templateId)
      .map((raw) => getMappedForm(raw))

    const isUnknown = !template
    const isLoading = formsPublic.status === 'loading'

    return {
      data: mappedList,
      view,
      layout: getLayout(view),
      isLoading,
      isError: formsPublic.status === 'error',
      // Kategori yang tidak dikenal diperlakukan sebagai kosong, bukan gagal —
      // yang keliru alamatnya, bukan servernya.
      isEmpty: isUnknown || (!isLoading && !mappedList.length),
      name: template?.name ?? 'Kategori Tidak Dikenal',
      tagline: template?.tagline ?? '',
      actionLabel: VIEW_ACTION[view],
      countLabel: VIEW_COUNT_LABEL[view],
      fieldLabel: VIEW_FIELD_LABEL[view],
      isTemplateAvailable: !!template,
      totalForm: mappedList.length,
      emptyTitle: isUnknown ? 'Kategori Tidak Ada' : 'Belum Ada Yang Terbuka',
      emptySubtitle: isUnknown
        ? 'Alamat kategori ini tidak dikenal. Kembali ke halaman depan untuk melihat kategori yang tersedia.'
        : `Belum ada ${(template?.name ?? 'form').toLowerCase()} yang bisa diikuti sekarang. Pakai templatenya untuk membuka yang pertama.`,
      errorTitle: 'Something Broke',
      errorSubtitle: formsPublic.statusSubtitle,
    }
  }, [templateId, formsPublic])

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
      <Button asChild variant="outline" size="sm">
        <Link href="/#kategori">
          <ArrowLeft /> Semua Kategori
        </Link>
      </Button>

      <div className="mt-8 flex items-stretch gap-3">
        <span className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
          KATEGORI
        </span>
        <span aria-hidden className="brutal-hatch flex-1 opacity-20" />
      </div>

      <div className="mt-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="max-w-2xl break-words font-display text-[clamp(1.9rem,4.5vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
            {data.name}
            <span className="text-primary">.</span>
          </h1>
          {data.tagline ? (
            <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
              {data.tagline}
            </p>
          ) : null}
        </div>

        {data.isTemplateAvailable ? (
          <Button asChild size="sm">
            <Link href={`/forms/create?template=${templateId}`}>
              <Sparkles /> Use Template
            </Link>
          </Button>
        ) : null}
      </div>

      <p className="brutal-eyebrow mt-6 text-muted-foreground">
        {String(data.totalForm).padStart(2, '0')} TERSEDIA
      </p>

      <div className="mt-8">
        <LoadData response={data} minHeight="40vh">
          {data.layout === 'list' ? (
            <div className="border-x-2 border-t-2 border-foreground">
              {data.data.map((form, index) => (
                <Link
                  key={form.id}
                  href={`/forms/${form.id}`}
                  className="group flex items-start gap-4 border-b-2 border-foreground bg-paper px-5 py-6 transition-colors hover:bg-muted sm:gap-6 sm:px-7"
                >
                  <span className="brutal-index group-hover:bg-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 className="break-words font-display text-xl font-black uppercase leading-tight tracking-tight">
                      {form.title}
                    </h2>
                    {form.description ? (
                      <p className="mt-2 line-clamp-2 font-mono text-xs leading-relaxed text-muted-foreground">
                        {form.description}
                      </p>
                    ) : null}
                    <p className="brutal-eyebrow mt-3 text-muted-foreground">
                      {String(form.totalField).padStart(2, '0')}{' '}
                      {data.fieldLabel} ·{' '}
                      {String(form.totalResponse).padStart(2, '0')}{' '}
                      {data.countLabel}
                    </p>
                  </div>

                  <span className="hidden shrink-0 sm:block">
                    <span className="brutal-eyebrow flex items-center gap-2 border-2 border-foreground px-3 py-2 transition-colors group-hover:bg-foreground group-hover:text-background">
                      {data.actionLabel}
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition-colors group-hover:text-primary sm:hidden" />
                </Link>
              ))}
            </div>
          ) : (
            <div
              className={cn(
                'grid gap-6',
                data.layout === 'menu'
                  ? 'sm:grid-cols-2 lg:grid-cols-3'
                  : 'sm:grid-cols-2'
              )}
            >
              {data.data.map((form) => (
                <Link
                  key={form.id}
                  href={`/forms/${form.id}`}
                  className="group flex flex-col border-2 border-foreground bg-paper transition-shadow hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]"
                >
                  {/* Poster acara dan sampul kelas adalah alasan orang berhenti
                      menggulir, jadi gambarnya diberi ruang lebih dulu. */}
                  {data.layout === 'poster' ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden border-b-2 border-foreground bg-muted">
                      {form.bannerUrl ? (
                        <Image
                          src={form.bannerUrl}
                          // Poster acara dan sampul kelas kerap memuat tanggal
                          // dan tempat, jadi bukan gambar hiasan — namanya
                          // disebut seperti pada halaman isi form.
                          alt={`Banner ${form.title}`}
                          fill
                          // Banner tinggal di Supabase Storage yang tidak
                          // terdaftar di remotePatterns; optimizer dilewati
                          // seperti pada halaman isi form.
                          unoptimized
                          sizes="(min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="brutal-hatch absolute inset-0 opacity-20"
                        />
                      )}
                      {form.isPaid ? (
                        <span className="brutal-eyebrow absolute left-0 top-0 bg-foreground px-3 py-2 text-background">
                          {form.priceText}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h2 className="break-words font-display text-xl font-black uppercase leading-tight tracking-tight">
                      {form.title}
                    </h2>
                    {form.description ? (
                      <p className="line-clamp-3 font-mono text-xs leading-relaxed text-muted-foreground">
                        {form.description}
                      </p>
                    ) : null}

                    <p className="brutal-eyebrow mt-auto flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {String(form.totalResponse).padStart(2, '0')}{' '}
                      {data.countLabel} ·{' '}
                      {String(form.totalField).padStart(2, '0')}{' '}
                      {data.fieldLabel}
                    </p>

                    <div className="flex items-center justify-between gap-3">
                      {data.layout === 'menu' ? (
                        <Badge variant="outline">{form.priceText}</Badge>
                      ) : (
                        <span />
                      )}
                      <span className="brutal-eyebrow flex items-center gap-2 border-2 border-foreground px-3 py-2 transition-colors group-hover:bg-foreground group-hover:text-background">
                        {data.actionLabel}
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </LoadData>

        {/* Placeholder LoadData tidak punya slot aksi. */}
        {data.isError ? (
          <div className="mt-6 flex justify-center">
            <Button onClick={() => fetchFormsPublic.refetch()}>Retry</Button>
          </div>
        ) : null}

        {data.isEmpty && data.isTemplateAvailable ? (
          <div className="mt-6 flex justify-center">
            <Button asChild size="sm">
              <Link href={`/forms/create?template=${templateId}`}>
                <Sparkles /> Use Template
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
