'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'

import type { DataForms } from '../types/formsTypes'
import { useFormsStates } from '../states/formsStates'
import { useFormsControllers } from '../controllers/formsControllers'

import { Button } from '@/components/ui/button'
import { LoadData } from '@/shared/components/load-data'
import FormsHero from './formsHero'
import FormsCategory from './formsCategory'
import { FORMS_TEMPLATES } from './formsTemplate'

/** Pita berjalan di antara section; digandakan supaya perulangannya mulus. */
const MARQUEE_WORDS = [
  'UJIAN TERKUNCI',
  'PENDAFTARAN ACARA',
  'MENU RESTORAN',
  'KELAS BERBAYAR',
  'SKOR OTOMATIS',
  'BAYAR QRIS',
]

export default function FormsLanding() {
  const router = useRouter()
  const { forms } = useFormsStates()
  const { fetchForms } = useFormsControllers()

  const categoryRef = useRef<HTMLElement>(null)

  const [filters, setFilters] = useState({
    exploreId: '',
  })

  const data = useMemo(() => {
    const getViewLabel = (view: string) =>
      ({
        scoring: 'SKOR & PERINGKAT',
        exam: 'UJIAN TERKUNCI',
        survey: 'RINGKASAN SURVEI',
        event: 'DAFTAR PESERTA',
        order: 'PESANAN & BAYAR',
        course: 'KELAS BERBAYAR',
      })[view] ?? 'FORM'

    const getMappedForm = (item: DataForms) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      totalField: item.totalField,
      totalResponse: item.totalResponse,
    })

    const getRelatedForms = (templateId: string) =>
      forms.data
        .filter((raw) => raw.isPublished && raw.templateId === templateId)
        .map((raw) => getMappedForm(raw))

    const visibleTemplates = FORMS_TEMPLATES.filter(
      (template) => template.isVisible
    )

    const mappedList = visibleTemplates.map((template) => {
      const relatedForms = getRelatedForms(template.id)

      return {
        id: template.id,
        name: template.name,
        tagline: template.tagline,
        viewLabel: getViewLabel(template.view),
        icon: template.icon,
        totalField: template.values.fields.length,
        totalForm: relatedForms.length,
        isExploring: filters.exploreId === template.id,
        forms: relatedForms,
        emptyExploreTitle: 'Belum Ada Yang Terbuka',
        emptyExploreSubtitle: `Belum ada ${template.name.toLowerCase()} yang bisa diikuti sekarang. Pakai templatenya untuk membuka yang pertama.`,
      }
    })

    const publishedForms = forms.data.filter((raw) => raw.isPublished)
    const totalResponse = forms.data.reduce(
      (total, raw) => total + raw.totalResponse,
      0
    )

    return {
      data: mappedList,
      isLoading: forms.status === 'loading',
      isError: forms.status === 'error',
      isEmpty: !mappedList.length,
      emptyTitle: 'No Category Yet',
      emptySubtitle:
        'Belum ada kategori yang bisa dipilih. Coba muat ulang halaman ini nanti.',
      emptyImage: '/no-data.svg',
      errorTitle: 'Something Broke',
      errorSubtitle: forms.statusSubtitle,
      totalCategory: mappedList.length,
      totalForm: publishedForms.length,
      totalResponse,
      heroCategories: mappedList.map((item) => ({
        id: item.id,
        name: item.name,
        viewLabel: item.viewLabel,
        icon: item.icon,
      })),
      marqueeWords: [...MARQUEE_WORDS, ...MARQUEE_WORDS],
    }
  }, [filters, forms])

  // Kategori memakai template yang sama dengan builder, jadi "Use Template"
  // cukup meneruskan idnya lewat query string seperti di riwayat form.
  const loadFormsTemplate = (templateId: string) => {
    router.push(`/forms/create?template=${templateId}`)
  }

  // Membuka daftar form yang sudah live dari kategori itu; klik ulang menutup.
  const loadFormsExplore = (templateId: string) => {
    setFilters((prev) => ({
      ...prev,
      exploreId: prev.exploreId === templateId ? '' : templateId,
    }))
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
        totalResponse={data.totalResponse}
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
              KATEGORI
            </span>
            <span aria-hidden className="brutal-hatch flex-1 opacity-20" />
          </div>

          <h2 className="mt-7 max-w-2xl break-words font-display text-[clamp(1.9rem,4.5vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
            Pilih kategorinya
            <span className="text-primary">.</span>
          </h2>

          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
            Pakai templatenya untuk membuat sendiri, atau eksplor untuk ikut
            form yang sudah dibuka orang lain.
          </p>

          <div className="mt-12">
            <LoadData response={data} minHeight="30vh">
              <FormsCategory
                data={data.data}
                isLoading={data.isLoading}
                onLoadFormsTemplate={loadFormsTemplate}
                onLoadFormsExplore={loadFormsExplore}
              />
            </LoadData>

            {/* Placeholder LoadData tidak punya slot aksi. */}
            {data.isError ? (
              <div className="mt-6 flex justify-center">
                <Button onClick={() => fetchForms.refetch()}>Retry</Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

    </>
  )
}
