'use client'

import { useMemo, useRef } from 'react'
import { useRouter } from 'next/router'

import { useFormsStates } from '../states/formsStates'
import { useFormsControllers } from '../controllers/formsControllers'

import { Button } from '@/components/ui/button'
import { LoadData } from '@/shared/components/load-data'
import FormsHero from './formsHero'
import FormsCategory from './formsCategory'
import { FORMS_TEMPLATES, getFormsViewCopy } from './formsTemplate'

const HERO_EVENT_LIMIT = 4

const MARQUEE_WORDS = [
  'TEKNOLOGI',
  'OLAHRAGA',
  'MUSIK & SENI',
  'BISNIS & KARIER',
  'TIKET TERBIT SENDIRI',
]

export default function FormsLanding() {
  const router = useRouter()
  const { formsPublic } = useFormsStates()
  const { fetchFormsPublic } = useFormsControllers()

  const categoryRef = useRef<HTMLElement>(null)

  const data = useMemo(() => {
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
        }))

    const getTotalForm = (templateId: string) =>
      formsPublic.data.filter((raw) => raw.templateId === templateId).length

    const visibleTemplates = FORMS_TEMPLATES.filter(
      (template) => template.isFeatured
    )

    const mappedList = visibleTemplates.map((template) => {
      const copy = getFormsViewCopy(template, template.view)

      return {
        id: template.id,
        name: template.name,
        description: copy.lead,
        icon: template.icon,
        availabilityText: `${String(getTotalForm(template.id)).padStart(
          2,
          '0'
        )} ${copy.availabilityLabel}`,
        actionLabel: copy.action,
        countLabel: copy.countLabel,
        fieldLabel: copy.fieldLabel,
        emptyTitle: copy.emptyTitle,
        emptySubtitle: copy.emptySubtitle,
        forms: getCategoryForms(template.id),
      }
    })

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
      heroEvents: visibleTemplates
        .flatMap((template) =>
          getCategoryForms(template.id).map((form) => ({
            id: form.id,
            href: form.slug ? `/f/${form.slug}` : `/forms/${form.id}`,
            title: form.title,
            categoryName: template.name,
            icon: template.icon,
            totalResponses: form.totalResponses,
          }))
        )
        .sort((left, right) => right.totalResponses - left.totalResponses)
        .slice(0, HERO_EVENT_LIMIT),
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
        events={data.heroEvents}
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
            Pilih acaranya,
            <br />
            langsung ikut
            <span className="text-primary">.</span>
          </h2>

          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
            Semua pendaftarannya sedang dibuka sekarang. Pilih kategori yang
            kamu minati dan daftar langsung — tanpa perlu membuat apa pun
            lebih dulu.
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
