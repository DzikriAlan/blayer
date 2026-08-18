'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BarChart3, Loader2 } from 'lucide-react'

import type { PayloadPostResponses } from '../types/responsesTypes'
import { useResponsesStates } from '../states/responsesStates'
import { useResponsesControllers } from '../controllers/responsesControllers'
import { useFormsStates } from '@/features/forms/states/formsStates'
import { useFormsControllers } from '@/features/forms/controllers/formsControllers'
import {
  FORMS_TEMPLATES,
  FORMS_TEMPLATE_DEFAULT_VIEW,
} from '@/features/forms/components/formsTemplate'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import SectionHead from '@/components/section-head'
import StatusView from '@/components/status-view'
import ResponsesField from './responsesField'
import ResponsesGuard from './responsesGuard'
import ResponsesEvent from './responsesEvent'

const IDENTITY_OFFSET = 2

interface Props {
  formId: string
}

export default function ResponsesSubmit({ formId }: Props) {
  const { formsDetail, setGetFormsDetail } = useFormsStates()
  const { fetchFormsDetail } = useFormsControllers()
  const { responses } = useResponsesStates()
  const { storeResponses } = useResponsesControllers()

  const [filters, setFilters] = useState({
    respondentName: '',
    respondentEmail: '',
    answers: {} as Record<string, string | string[]>,
    errors: {} as Record<string, string>,
    startedAt: 0,
    elapsedSeconds: 0,
    violationCount: 0,
  })

  const data = useMemo(() => {
    const getAnswer = (fieldId: string) => filters.answers[fieldId] ?? ''

    // Bentuk halaman ditentukan template asal form, bukan oleh pengisi.
    const getView = () => {
      const template = FORMS_TEMPLATES.find(
        (item) => item.id === formsDetail.data?.templateId
      )
      return template?.view ?? FORMS_TEMPLATE_DEFAULT_VIEW
    }

    // Tanggal dan sesi acara diambil dari jawaban peserta sendiri, karena
    // itulah satu-satunya sumber yang ada tanpa menambah field baru di form.
    const getFirstAnswerByType = (type: string) => {
      const field = (formsDetail.data?.fields ?? []).find(
        (item) => item.type === type
      )
      if (!field) return ''
      const answer = filters.answers[field.id]
      return Array.isArray(answer) ? answer.join(', ') : String(answer ?? '')
    }

    const getEventDateText = () => {
      const raw = getFirstAnswerByType('DATE')
      if (!raw) return ''
      const parsed = new Date(raw)
      if (Number.isNaN(parsed.getTime())) return raw
      return parsed.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }

    const getDurationText = (totalSecond: number) => {
      const minute = Math.floor(totalSecond / 60)
      const second = totalSecond % 60
      return `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
    }

    const mappedList = (formsDetail.data?.fields ?? []).map((field, index) => ({
      index: index + IDENTITY_OFFSET,
      field,
      value: getAnswer(field.id),
      error: filters.errors[field.id] ?? '',
    }))

    return {
      data: mappedList,
      isLoading: formsDetail.status === 'loading',
      isError: formsDetail.status === 'error',
      isEmpty: formsDetail.status === 'success' && !mappedList.length,
      emptyTitle: 'No Questions Yet',
      emptySubtitle: 'Pembuat form belum menambahkan field apa pun.',
      emptyImage: '/no-data.svg',
      errorTitle: 'Form Not Found',
      errorSubtitle:
        'Form yang kamu cari tidak tersedia atau sudah dihapus oleh pembuatnya.',
      pagination: { currentPage: 1, perPage: mappedList.length },
      title: formsDetail.data?.title ?? 'Untitled Form',
      description:
        formsDetail.data?.description ||
        'This form is collecting responses.\nFill it out honestly and directly.\nNo nonsense.',
      isAiEnabled: formsDetail.data?.isAiEnabled ?? false,
      isProctored: getView() === 'exam',
      hasEventDetail: getView() === 'event',
      isEventDone: getView() === 'event',
      bannerUrl: formsDetail.data?.bannerUrl ?? '',
      meetingUrl: formsDetail.data?.meetingUrl ?? '',
      eventDateText: getEventDateText(),
      eventSessionText: getFirstAnswerByType('SELECT'),
      totalAttendee: responses.data?.totalResponse ?? 0,
      durationText: getDurationText(filters.elapsedSeconds),
      violationCount: filters.violationCount,
      isSubmitting: storeResponses.isPending || responses.status === 'loading',
      isSubmitted: responses.status === 'success',
      submitError: responses.status === 'error' ? responses.statusSubtitle : '',
    }
  }, [filters, formsDetail, responses, storeResponses.isPending])

  const editAnswer = (fieldId: string, value: string | string[]) => {
    setFilters((prev) => ({
      ...prev,
      answers: { ...prev.answers, [fieldId]: value },
      errors: { ...prev.errors, [fieldId]: '' },
    }))
  }

  const editRespondent = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const editViolation = () => {
    setFilters((prev) => ({ ...prev, violationCount: prev.violationCount + 1 }))
  }

  const clearResponses = () => {
    setFilters((prev) => ({
      ...prev,
      respondentName: '',
      respondentEmail: '',
      answers: {},
      errors: {},
    }))
  }

  const submitResponses = (event: React.FormEvent) => {
    event.preventDefault()

    const getEmptyErrors = () => {
      const errors: Record<string, string> = {}
      ;(formsDetail.data?.fields ?? []).forEach((field) => {
        if (!field.isRequired) return
        const answer = filters.answers[field.id]
        const isEmpty = Array.isArray(answer)
          ? !answer.length
          : !answer || !String(answer).trim()
        if (isEmpty) errors[field.id] = 'This field is required.'
      })
      return errors
    }

    const errors = getEmptyErrors()

    if (Object.keys(errors).length) {
      setFilters((prev) => ({ ...prev, errors }))
      return
    }

    const getDurationSeconds = () =>
      filters.startedAt
        ? Math.max(Math.round((Date.now() - filters.startedAt) / 1000), 0)
        : 0

    const payload: PayloadPostResponses = {
      formId,
      respondentName: filters.respondentName,
      respondentEmail: filters.respondentEmail,
      answers: filters.answers,
      durationSeconds: getDurationSeconds(),
    }

    storeResponses.mutate(payload)
  }

  useEffect(() => {
    if (formId) setGetFormsDetail({ id: formId })
  }, [formId, setGetFormsDetail])

  // Stopwatch mulai begitu pertanyaan tampil, berhenti saat jawaban terkirim.
  useEffect(() => {
    if (formsDetail.status !== 'success') return
    if (responses.status === 'success') return

    setFilters((prev) =>
      prev.startedAt ? prev : { ...prev, startedAt: Date.now() }
    )

    const timer = window.setInterval(() => {
      setFilters((prev) => ({
        ...prev,
        elapsedSeconds: prev.startedAt
          ? Math.max(Math.round((Date.now() - prev.startedAt) / 1000), 0)
          : 0,
      }))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [formsDetail.status, responses.status])

  if (data.isSubmitted && data.isEventDone) {
    return (
      <ResponsesEvent
        formId={formId}
        title={data.title}
        description={formsDetail.data?.description ?? ''}
        bannerUrl={data.bannerUrl}
        meetingUrl={data.meetingUrl}
        respondentName={filters.respondentName}
        dateText={data.eventDateText}
        sessionText={data.eventSessionText}
        totalAttendee={data.totalAttendee}
      />
    )
  }

  if (data.isSubmitted) {
    return (
      <div className="border-2 border-foreground">
        <div className="bg-primary px-7 py-12 text-primary-foreground">
          <p className="brutal-eyebrow">RESPONSE RECORDED</p>
          <h1 className="mt-4 font-display text-[clamp(2.25rem,7vw,4rem)] font-black uppercase leading-[0.86] tracking-[-0.03em]">
            Thanks.
            <br />
            You&apos;re done
            <span className="text-foreground">.</span>
          </h1>
          <p className="mt-5 max-w-md font-mono text-sm leading-relaxed">
            {data.isAiEnabled
              ? 'Jawabanmu sudah tersimpan dan siap dianalisis oleh AI berdasarkan tujuan form ini.'
              : 'Jawabanmu sudah tersimpan.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 bg-paper px-7 py-6">
          <Button asChild>
            <Link href={`/forms/${formId}/result`}>
              <BarChart3 />
              {data.isAiEnabled ? 'Lihat Analisis' : 'Lihat Jawaban'}
            </Link>
          </Button>
          <Button asChild variant="danger" size="sm">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (data.isLoading) {
    return (
      <div className="flex flex-col gap-0">
        <Skeleton className="h-52 w-full" />
        <Skeleton className="mt-[-2px] h-28 w-full" />
        <Skeleton className="mt-[-2px] h-28 w-full" />
      </div>
    )
  }

  if (data.isError) {
    return (
      <StatusView
        title={data.errorTitle}
        subtitle={data.errorSubtitle}
        image={data.emptyImage}
      >
        <Button onClick={() => fetchFormsDetail.refetch()}>Coba Lagi</Button>
      </StatusView>
    )
  }

  return (
    <form
      onSubmit={submitResponses}
      className={cn(
        'border-2 border-foreground',
        data.isProctored && 'select-none'
      )}
    >
      <ResponsesGuard
        isActive={data.isProctored}
        violationCount={data.violationCount}
        durationText={data.durationText}
        onEditViolation={editViolation}
      />

      {data.hasEventDetail && data.bannerUrl ? (
        <div className="border-b-2 border-foreground bg-muted">
          {/* width/height 0 + sizes: rasio diambil dari berkasnya sendiri,
              jadi poster tinggi maupun banner lebar sama-sama tampil utuh. */}
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

      <SectionHead
        tag="SECTION 01"
        title={data.title}
        description={data.description}
        className="bg-paper px-5 pt-6 sm:px-7"
      />

      <div className="flex gap-4 border-b-2 border-foreground bg-paper px-5 py-6 sm:gap-6 sm:px-7">
        <span className="brutal-index">01</span>
        <div className="min-w-0 flex-1">
          <Label htmlFor="respondent-name" className="text-[13px]">
            Full Name
          </Label>
          <div className="mt-4">
            <Input
              id="respondent-name"
              value={filters.respondentName}
              placeholder="Type your answer"
              onChange={(event) =>
                editRespondent('respondentName', event.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b-2 border-foreground bg-paper px-5 py-6 sm:gap-6 sm:px-7">
        <span className="brutal-index">02</span>
        <div className="min-w-0 flex-1">
          <Label htmlFor="respondent-email" className="text-[13px]">
            Email Address
          </Label>
          <div className="mt-4">
            <Input
              id="respondent-email"
              type="email"
              value={filters.respondentEmail}
              placeholder="Type your answer"
              onChange={(event) =>
                editRespondent('respondentEmail', event.target.value)
              }
            />
          </div>
        </div>
      </div>

      {data.isEmpty ? (
        <StatusView
          title={data.emptyTitle}
          subtitle={data.emptySubtitle}
          image={data.emptyImage}
          className="border-0 border-b-2"
        />
      ) : null}

      {data.data.map((item) => (
        <ResponsesField
          key={item.field.id}
          index={item.index}
          field={item.field}
          value={item.value}
          error={item.error}
          onEditAnswer={editAnswer}
        />
      ))}

      {data.submitError ? (
        <p className="brutal-eyebrow border-b-2 border-foreground bg-primary px-7 py-4 text-primary-foreground">
          {data.submitError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-5 bg-paper px-5 py-7 sm:px-7">
        <Button type="submit" size="lg" disabled={data.isSubmitting}>
          {data.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Sending
            </>
          ) : (
            <>
              Submit <ArrowRight />
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={clearResponses}
        >
          Clear Form
        </Button>
      </div>
    </form>
  )
}
