'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'

import BackLink from '@/components/back-link'
import { Button } from '@/components/ui/button'
import { LoadData } from '@/shared/components/load-data'
import FormsFacepile from './formsFacepile'
import FormsPoster from './formsPoster'
import type { DataFormsPublic } from '../types/formsTypes'
import { useFormsStates } from '../states/formsStates'
import { useFormsControllers } from '../controllers/formsControllers'
import {
  FORMS_TEMPLATES,
  FORMS_TEMPLATE_DEFAULT_VIEW,
  getFormsViewCopy,
  type FormsTemplateView,
} from './formsTemplate'

const getLayout = (view: FormsTemplateView) =>
  view === 'event' ? 'poster' : 'list'

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
      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        image: item.image,
        tooltip: item.title,
        totalFields: item.totalFields,
        totalResponses: item.totalResponses,
      }
    }

    const mappedList = formsPublic.data
      .filter((raw) => raw.templateId === templateId)
      .map((raw) => getMappedForm(raw))

    const isUnknown = !template
    const isLoading = formsPublic.status === 'loading'
    const copy = getFormsViewCopy(template, view)

    return {
      data: mappedList,
      view,
      layout: getLayout(view),
      isLoading,
      isError: formsPublic.status === 'error',
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
          {data.layout === 'list' ? (
            <div className="border-x-2 border-t-2 border-foreground">
              {data.data.map((form, index) => (
                <Link
                  key={form.id}
                  href={form.slug ? `/f/${form.slug}` : `/forms/${form.id}`}
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
                        {String(form.totalFields).padStart(2, '0')}{' '}
                        {data.fieldLabel} ·
                      </span>
                      <FormsFacepile
                        total={form.totalResponses}
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((form) => (
                <FormsPoster
                  key={form.id}
                  form={form}
                  actionLabel={data.actionLabel}
                  countLabel={data.countLabel}
                  fieldLabel={data.fieldLabel}
                  hasBanner
                />
              ))}
            </div>
          )}
        </LoadData>

        {data.isError ? (
          <div className="mt-6 flex justify-center">
            <Button onClick={() => fetchFormsPublic.refetch()}>Retry</Button>
          </div>
        ) : null}

      </div>
    </section>
  )
}
