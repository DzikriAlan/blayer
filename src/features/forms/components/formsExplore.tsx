'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowUpRight, Briefcase, Clock3 } from 'lucide-react'

import BackLink from '@/components/back-link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadData } from '@/shared/components/load-data'
import FormsFacepile from './formsFacepile'
import FormsProject from './formsProject'
import type { DataFormsPublic } from '../types/formsTypes'
import { useFormsStates } from '../states/formsStates'
import { useFormsControllers } from '../controllers/formsControllers'
import {
  FORMS_TEMPLATES,
  FORMS_TEMPLATE_DEFAULT_VIEW,
  FORMS_VIEW_COPY,
  type FormsTemplateView,
} from './formsTemplate'

/**
 * Bentuk sajian tiap kategori.
 *
 * Diturunkan dari `view` yang sama dengan yang sudah menentukan halaman isi,
 * layar setelah kirim, dan dashboard hasil — jadi menambah template baru tidak
 * menuntut komponen baru di sini.
 *
 * | view           | bentuk    | alasan                                              |
 * | -------------- | --------- | --------------------------------------------------- |
 * | `event`        | `poster`  | acara dijual lewat posternya, bukan lewat judul saja |
 * | `course`       | `poster`  | katalog kelas selalu memajang sampul dan harga       |
 * | `order`        | `menu`    | menu dibaca sekilas dan berdampingan, bukan berderet |
 * | `psychometric` | `job`     | lowongan dibaca seperti di job portal: logo, posisi, |
 * |                |           | keterangan singkat, lalu tombol melamar              |
 * | `freelance`    | `project` | papan proyek: anggaran dulu, baru pekerjaannya       |
 * | lainnya        | `list`    | ujian dan survei dibaca berurutan seperti daftar     |
 */
const getLayout = (view: FormsTemplateView) => {
  if (view === 'event' || view === 'course') return 'poster'
  if (view === 'order') return 'menu'
  if (view === 'psychometric') return 'job'
  if (view === 'freelance') return 'project'
  return 'list'
}

/**
 * Umur lowongan, ditulis seperti di job portal.
 *
 * Pelamar memakai ini untuk menakar peluang: lowongan yang baru dibuka masih
 * sepi pesaing, yang sudah sebulan biasanya sudah menutup diri diam-diam.
 */
const getPostedText = (createdAt: string) => {
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 86400000
  )

  if (!Number.isFinite(days) || days <= 0) return 'BARU HARI INI'
  if (days === 1) return 'KEMARIN'
  if (days < 30) return `${days} HARI LALU`

  const months = Math.floor(days / 30)
  return `${months} BULAN LALU`
}

/**
 * Keterangan kartu yang dipisah jadi chip.
 *
 * Papan lowongan dan papan proyek sama-sama memajang lokasi, bentuk kerja,
 * durasi, dan tingkat pengalaman sebagai potongan pendek yang bisa dipindai
 * sekilas — bukan sebagai kalimat yang harus dibaca sampai habis. Semuanya
 * tidak punya kolom sendiri di basis data, jadi diambil dari kepala deskripsi:
 * ruas-ruas yang dipisah "·" sampai kalimat pertama berakhir. Deskripsi yang
 * tidak menuruti bentuk itu ditinggal utuh sebagai paragraf, jadi form buatan
 * siapa pun tetap aman.
 */
const getCardDetail = (description: string) => {
  const parts = description
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length < 2) return { tags: [], text: description }

  const last = parts[parts.length - 1]
  const end = last.search(/\.(\s|$)/)
  const tags = [...parts.slice(0, -1), end === -1 ? last : last.slice(0, end)]

  return {
    tags: tags.filter(Boolean),
    text: end === -1 ? '' : last.slice(end + 1).trim(),
  }
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

    const getMappedForm = (item: DataFormsPublic) => {
      const detail = getCardDetail(item.description)

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        bannerUrl: item.bannerUrl,
        priceText: getPriceText(item.priceAmount),
        isPaid: item.priceAmount > 0,
        postedText: getPostedText(item.createdAt),
        // Judul kartu dipangkas supaya barisannya rata, jadi judul utuhnya
        // disediakan lewat tooltip bawaan peramban. Hanya judulnya — keterangan
        // sudah terbaca di kartunya sendiri.
        tooltip: item.title,
        tags: detail.tags,
        summary: detail.text,
        totalField: item.totalField,
        totalResponse: item.totalResponse,
      }
    }

    const mappedList = formsPublic.data
      .filter((raw) => raw.templateId === templateId)
      .map((raw) => getMappedForm(raw))

    const isUnknown = !template
    const isLoading = formsPublic.status === 'loading'
    const copy = FORMS_VIEW_COPY[view]

    return {
      data: mappedList,
      view,
      layout: getLayout(view),
      isLoading,
      isError: formsPublic.status === 'error',
      // Kategori yang tidak dikenal diperlakukan sebagai kosong, bukan gagal —
      // yang keliru alamatnya, bukan servernya.
      isEmpty: isUnknown || (!isLoading && !mappedList.length),
      heading: isUnknown ? 'Kategori Tidak Dikenal' : copy.heading,
      lead: isUnknown ? '' : copy.lead,
      actionLabel: copy.action,
      countLabel: copy.countLabel,
      fieldLabel: copy.fieldLabel,
      availabilityLabel: copy.availabilityLabel,
      totalForm: mappedList.length,
      emptyTitle: isUnknown ? 'Kategori Tidak Ada' : copy.emptyTitle,
      emptySubtitle: isUnknown
        ? 'Alamat kategori ini tidak dikenal. Kembali ke halaman depan untuk melihat kategori yang tersedia.'
        : copy.emptySubtitle,
      errorTitle: 'Something Broke',
      errorSubtitle: formsPublic.statusSubtitle,
    }
  }, [templateId, formsPublic])

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
      <div className="flex flex-wrap items-center gap-3">
        <BackLink
          href="/#kategori"
          className="border-foreground hover:bg-foreground hover:text-background"
        />
        <Button asChild variant="outline" size="sm" className="h-10">
          <Link href="/#kategori">
            <ArrowLeft /> Semua Kategori
          </Link>
        </Button>
      </div>

      <div className="mt-8 flex items-stretch gap-3">
        <span className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
          KATEGORI
        </span>
        <span aria-hidden className="brutal-hatch flex-1 opacity-20" />
      </div>

      <h1 className="mt-7 max-w-2xl break-words font-display text-[clamp(1.9rem,4.5vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
        {data.heading}
        <span className="text-primary">.</span>
      </h1>

      {data.lead ? (
        <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          {data.lead}
        </p>
      ) : null}

      <p className="brutal-eyebrow mt-6 text-muted-foreground">
        {String(data.totalForm).padStart(2, '0')} {data.availabilityLabel}
      </p>

      <div className="mt-8">
        <LoadData response={data} minHeight="40vh">
          {data.layout === 'project' ? (
            <FormsProject
              data={data.data}
              actionLabel={data.actionLabel}
              countLabel={data.countLabel}
              fieldLabel={data.fieldLabel}
            />
          ) : data.layout === 'job' ? (
            // Papan lowongan: tiap kartu memuat logo perusahaan, posisi, umur
            // lowongan, lalu tombol melamar — sama seperti di job portal. Tiga
            // kolom di layar lebar, sebaris dengan poster dan menu, supaya
            // pelamar bisa memindai banyak posisi tanpa menggulir jauh.
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((form) => (
                <Link
                  key={form.id}
                  href={`/forms/${form.id}`}
                  // min-w-0 wajib, alasannya sama seperti di papan proyek:
                  // tanpa itu baris chip yang tidak melipat menetapkan lebar
                  // minimum kartu, dan halamannya ikut melebar.
                  className="group flex min-w-0 flex-col gap-4 border-2 border-foreground bg-paper p-5 transition-shadow hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]"
                >
                  <div className="flex items-start gap-4">
                    {/* Logo perusahaan kalau diunggah; kalau tidak, lambang
                        posisi supaya barisan kartunya tetap sejajar. */}
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border-2 border-foreground bg-muted">
                      {form.bannerUrl ? (
                        <Image
                          src={form.bannerUrl}
                          alt={`Logo ${form.title}`}
                          fill
                          unoptimized
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <Briefcase className="h-5 w-5" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      {/* Judul lowongan memuat posisi sekaligus perusahaan,
                          jadi ukurannya ditahan lebih kecil dari kartu lain
                          dan dipotong di baris kedua — kalau tidak, satu judul
                          panjang mendorong sisa kartunya turun sendirian. */}
                      <h2
                        title={form.tooltip}
                        className="line-clamp-2 break-words font-display text-base font-black uppercase leading-tight tracking-tight sm:text-lg"
                      >
                        {form.title}
                      </h2>
                      <p className="brutal-eyebrow mt-2 flex items-center gap-1.5 text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        {form.postedText}
                      </p>
                    </div>
                  </div>

                  {/* Chip dibiarkan satu baris dan digeser ke samping, bukan
                      dilipat: kartunya sempit, dan chip yang melipat membuat
                      tinggi tiap kartu berbeda-beda tergantung panjang nama
                      kotanya. */}
                  <div className="brutal-scroll-thin flex gap-2 overflow-x-auto pb-1">
                    {/* Yang wajib diketahui pelamar sebelum membuka: psikotesnya
                        dikerjakan dalam layar terkunci. */}
                    <Badge className="shrink-0 whitespace-nowrap">
                      Psikotes Terkunci
                    </Badge>
                    {form.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="shrink-0 whitespace-nowrap"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {form.summary ? (
                    <p className="line-clamp-3 font-mono text-xs leading-relaxed text-muted-foreground">
                      {form.summary}
                    </p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1">
                    <FormsFacepile
                      total={form.totalResponse}
                      seed={form.id}
                      label={data.countLabel}
                    />
                    <span className="brutal-eyebrow text-muted-foreground">
                      · {String(form.totalField).padStart(2, '0')}{' '}
                      {data.fieldLabel}
                    </span>
                  </div>

                  {/* Harga tidak pernah berlaku untuk lowongan, jadi kakinya
                      hanya berisi ajakan melamar. */}
                  <div className="flex justify-end">
                    <span className="brutal-eyebrow flex items-center gap-2 border-2 border-foreground px-3 py-2 transition-colors group-hover:bg-foreground group-hover:text-background">
                      {data.actionLabel}
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : data.layout === 'list' ? (
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
                    <h2
                      title={form.tooltip}
                      className="break-words font-display text-xl font-black uppercase leading-tight tracking-tight"
                    >
                      {form.title}
                    </h2>
                    {form.description ? (
                      <p className="mt-2 line-clamp-2 font-mono text-xs leading-relaxed text-muted-foreground">
                        {form.description}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="brutal-eyebrow text-muted-foreground">
                        {String(form.totalField).padStart(2, '0')}{' '}
                        {data.fieldLabel} ·
                      </span>
                      <FormsFacepile
                        total={form.totalResponse}
                        seed={form.id}
                        label={data.countLabel}
                      />
                    </div>
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
            // Poster dan menu sama-sama dibaca dengan cara memindai, jadi
            // keduanya memakai grid yang sama: dua kolom begitu muat, tiga di
            // layar lebar. Yang membedakan tetap isinya — sampul dan harga.
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((form) => (
                <Link
                  key={form.id}
                  href={`/forms/${form.id}`}
                  className="group flex flex-col border-2 border-foreground bg-paper transition-shadow hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]"
                >
                  {/* Poster acara dan sampul kelas adalah alasan orang berhenti
                      menggulir, jadi gambarnya diberi ruang lebih dulu. */}
                  {data.layout === 'poster' ? (
                    <div className="relative min-h-32 w-full overflow-hidden border-b-2 border-foreground bg-muted">
                      {/* Latar bergaris menutup sisa ruang saat poster tidak
                          sebangun dengan bingkainya. */}
                      <span
                        aria-hidden
                        className="brutal-hatch absolute inset-0 opacity-20"
                      />
                      {form.bannerUrl ? (
                        // Bingkainya sengaja tidak dikunci ke satu perbandingan
                        // dan tingginya mengikuti gambar: poster acara maupun
                        // sampul kelas tampil utuh, tanpa terpotong dan tanpa
                        // menyisakan pita kosong di kiri-kanannya.
                        //
                        // Memakai <img> biasa, bukan next/image, justru karena
                        // ukuran asli banner tidak diketahui di server — dan
                        // next/image menuntut ukuran itu ditulis di muka, yang
                        // berarti mengarang perbandingan yang belum tentu benar.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={form.bannerUrl}
                          // Poster acara dan sampul kelas kerap memuat tanggal
                          // dan tempat, jadi bukan gambar hiasan — namanya
                          // disebut seperti pada halaman isi form.
                          alt={`Banner ${form.title}`}
                          loading="lazy"
                          // Batas tinggi menahan poster yang sangat jangkung
                          // supaya tidak mendorong seluruh isi kartu ke bawah.
                          className="relative block h-auto max-h-[22rem] w-full object-contain"
                        />
                      ) : null}
                      {form.isPaid ? (
                        <span className="brutal-eyebrow absolute left-0 top-0 bg-foreground px-3 py-2 text-background">
                          {form.priceText}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h2
                      title={form.tooltip}
                      className="break-words font-display text-xl font-black uppercase leading-tight tracking-tight"
                    >
                      {form.title}
                    </h2>
                    {form.description ? (
                      <p className="line-clamp-3 font-mono text-xs leading-relaxed text-muted-foreground">
                        {form.description}
                      </p>
                    ) : null}

                    <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1">
                      <FormsFacepile
                        total={form.totalResponse}
                        seed={form.id}
                        label={data.countLabel}
                      />
                      <span className="brutal-eyebrow text-muted-foreground">
                        · {String(form.totalField).padStart(2, '0')}{' '}
                        {data.fieldLabel}
                      </span>
                    </div>

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

      </div>
    </section>
  )
}
