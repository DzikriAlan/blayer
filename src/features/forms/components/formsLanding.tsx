'use client'

import { useMemo, useRef } from 'react'
import { useRouter } from 'next/router'

import { useFormsStates } from '../states/formsStates'
import { useFormsControllers } from '../controllers/formsControllers'

import { Button } from '@/components/ui/button'
import { LoadData } from '@/shared/components/load-data'
import FormsHero from './formsHero'
import FormsCategory from './formsCategory'
import { FORMS_TEMPLATES, FORMS_VIEW_COPY } from './formsTemplate'

const MARQUEE_WORDS = [
  'PENDAFTARAN ACARA',
  'LAMARAN KERJA',
  'SURVEI KEPUASAN',
  'SKOR OTOMATIS',
  'PERINGKAT SENDIRI',
]

export default function FormsLanding() {
  const router = useRouter()
  const { formsPublic } = useFormsStates()
  const { fetchFormsPublic } = useFormsControllers()

  const categoryRef = useRef<HTMLElement>(null)

  const data = useMemo(() => {
    const getViewLabel = (view: string) =>
      ({
        scoring: 'SKOR & PERINGKAT',
        survey: 'RINGKASAN SURVEI',
        event: 'DAFTAR PESERTA',
      })[view] ?? 'FORM'

    const getShortName = (view: string) =>
      ({
        event: 'Event',
        survey: 'Survei',
        scoring: 'Form',
      })[view] ?? 'Form'

    const getTags = (description: string) =>
      description
        .split('·')
        .slice(0, -1)
        .map((part) => part.trim().toUpperCase())
        .filter((part) => part.length > 1 && part.length <= 24)

    const getCategoryForms = (templateId: string) =>
      formsPublic.data
        .filter((raw) => raw.templateId === templateId)
        .map((raw) => ({
          id: raw.id,
          slug: raw.slug,
          title: raw.title,
          description: raw.description,
          image: raw.image,
          totalResponses: raw.totalResponses,
          totalFields: raw.totalFields,
          tooltip: raw.title,
          tags: getTags(raw.description),
        }))

    const getTotalForm = (templateId: string) =>
      formsPublic.data.filter((raw) => raw.templateId === templateId).length

    const visibleTemplates = FORMS_TEMPLATES.filter(
      (template) => template.isFeatured
    )

    const getAvailabilityText = (template: (typeof FORMS_TEMPLATES)[number]) =>
      `${String(getTotalForm(template.id)).padStart(2, '0')} ${
        FORMS_VIEW_COPY[template.view].availabilityLabel
      }`

    const mappedList = visibleTemplates.map((template) => ({
      id: template.id,
      name: getShortName(template.view),
      description: FORMS_VIEW_COPY[template.view].lead,
      viewLabel: getViewLabel(template.view),
      icon: template.icon,
      availabilityText: getAvailabilityText(template),
      actionLabel: FORMS_VIEW_COPY[template.view].action,
      countLabel: FORMS_VIEW_COPY[template.view].countLabel,
      fieldLabel: FORMS_VIEW_COPY[template.view].fieldLabel,
      emptyText: FORMS_VIEW_COPY[template.view].emptySubtitle,
      forms: getCategoryForms(template.id),
    }))

    const totalResponses = formsPublic.data.reduce(
      (total, raw) => total + raw.totalResponses,
      0
    )

    return {
      data: mappedList,
      isLoading: formsPublic.status === 'loading',
      isError: formsPublic.status === 'error',
      isEmpty: !mappedList.length,
      emptyTitle: 'No Category Yet',
      emptySubtitle:
        'Belum ada yang bisa diikuti sekarang. Coba muat ulang halaman ini nanti.',
      emptyImage: '/no-data.svg',
      errorTitle: 'Something Broke',
      errorSubtitle: formsPublic.statusSubtitle,
      totalCategory: mappedList.length,
      totalForm: formsPublic.data.length,
      totalResponses,
      heroCategories: mappedList.map((item) => ({
        id: item.id,
        name: item.name,
        viewLabel: item.viewLabel,
        icon: item.icon,
      })),
      marqueeWords: [...MARQUEE_WORDS, ...MARQUEE_WORDS],
    }
  }, [formsPublic])

  const loadFormsExplore = (templateId: string) => {
    router.push(`/kategori/${templateId}`)
  }

  const loadFormsCategory = () => {
    categoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <FormsHero
        categories={data.heroCategories}
        totalCategory={data.totalCategory}
        totalForm={data.totalForm}
        totalResponses={data.totalResponses}
        onLoadFormsCategory={loadFormsCategory}
      />

      <div
        aria-hidden
        className="overflow-hidden border-b-2 border-foreground bg-foreground py-3 text-background"
      >
        <div className="brutal-marquee flex w-max items-center gap-8 pl-8">
          {data.marqueeWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="brutal-eyebrow flex shrink-0 items-center gap-8"
            >
              {word}
              <span className="text-primary">✳</span>
            </span>
          ))}
        </div>
      </div>

      <section
        ref={categoryRef}
        id="kategori"
        className="scroll-mt-24 border-b-2 border-foreground bg-background"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex items-stretch gap-3">
            <span className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
              YANG SEDANG TERBUKA
            </span>
            <span aria-hidden className="brutal-hatch flex-1 opacity-20" />
          </div>

          <h2 className="mt-7 max-w-2xl break-words font-display text-[clamp(1.9rem,4.5vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
            Ambil nilaimu,
            <br />
            ambil kebutuhanmu
            <span className="text-primary">.</span>
          </h2>

          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
            Semuanya sedang berjalan sekarang. Pilih yang kamu butuhkan dan
            ikut langsung — tanpa perlu membuat apa pun lebih dulu.
          </p>

          <div className="mt-12">
            <LoadData response={data} minHeight="30vh">
              <FormsCategory
                data={data.data}
                onLoadFormsExplore={loadFormsExplore}
              />
            </LoadData>

            {data.isError ? (
              <div className="mt-6 flex justify-center">
                <Button onClick={() => fetchFormsPublic.refetch()}>Retry</Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

    </>
  )
}
