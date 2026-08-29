'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
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

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SectionHead from '@/components/section-head'
import { LoadData } from '@/shared/components/load-data'
import ResponsesField from './responsesField'
import ResponsesEvent from './responsesEvent'

interface Props {
  formId: string
}

export default function ResponsesSubmit({ formId }: Props) {
  const { formsDetail, setGetFormsDetail } = useFormsStates()
  const { fetchFormsDetail } = useFormsControllers()
  const { responses } = useResponsesStates()
  const { storeResponses } = useResponsesControllers()

  const [filters, setFilters] = useState({
    name: '',
    email: '',
    answers: {} as Record<string, string | string[]>,
    errors: {} as Record<string, string>,
  })

  const data = useMemo(() => {
    const getAnswer = (fieldId: string) => filters.answers[fieldId] ?? ''

    const getView = () => {
      const template = FORMS_TEMPLATES.find(
        (item) => item.id === formsDetail.data?.templateId
      )
      return template?.view ?? FORMS_TEMPLATE_DEFAULT_VIEW
    }

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

    const mappedList = (formsDetail.data?.fields ?? []).map((field, index) => ({
      index: index + 2,
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
      pageState: {
        isLoading: formsDetail.status === 'loading',
        isError: formsDetail.status === 'error',
        errorTitle: 'Form Not Found',
        errorSubtitle:
          'Form yang kamu cari tidak tersedia atau sudah dihapus oleh pembuatnya.',
        errorImage: '/no-data.svg',
      },
      questionState: {
        isEmpty: formsDetail.status === 'success' && !mappedList.length,
        emptyTitle: 'No Questions Yet',
        emptySubtitle: 'Pembuat form belum menambahkan field apa pun.',
        emptyImage: '/no-data.svg',
      },
      pagination: { currentPage: 1, perPage: mappedList.length },
      title: formsDetail.data?.title ?? 'Untitled Form',
      description:
        formsDetail.data?.description ||
        'This form is collecting responses.\nFill it out honestly and directly.\nNo nonsense.',
      isEventDone: getView() === 'event',
      hasBanner: getView() === 'event',
      image: formsDetail.data?.image ?? '',
      meeting: responses.data?.meeting || formsDetail.data?.meeting || '',
      eventDateText: getEventDateText(),
      eventSessionText: getFirstAnswerByType('SELECT'),
      totalAttendee: responses.data?.totalResponses ?? 0,
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

  const clearResponses = () => {
    setFilters((prev) => ({
      ...prev,
      name: '',
      email: '',
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
      startedAtRef.current
        ? Math.max(Math.round((Date.now() - startedAtRef.current) / 1000), 0)
        : 0

    const getSubmitKey = () => {
      if (!submitKeyRef.current) {
        submitKeyRef.current =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      }
      return submitKeyRef.current
    }

    const payload: PayloadPostResponses = {
      formId,
      name: filters.name,
      email: filters.email,
      answers: filters.answers,
      duration: getDurationSeconds(),
      idempotencyKey: getSubmitKey(),
    }

    storeResponses.mutate(payload)
  }

  useEffect(() => {
    if (formId) setGetFormsDetail({ id: formId })
  }, [formId, setGetFormsDetail])

  const startedAtRef = useRef(0)
  const submitKeyRef = useRef('')

  useEffect(() => {
    if (formsDetail.status !== 'success') return
    if (responses.status === 'success') return
    if (startedAtRef.current) return

    startedAtRef.current = Date.now()
  }, [formsDetail.status, responses.status])

  if (data.isSubmitted && data.isEventDone) {
    return (
      <ResponsesEvent
        formId={formId}
        title={data.title}
        description={formsDetail.data?.description ?? ''}
        image={data.image}
        meeting={data.meeting}
        name={filters.name}
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
            Jawabanmu sudah tersimpan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 bg-paper px-7 py-6">
          <Button asChild>
            <Link href={`/forms/${formId}/result`}>
              <BarChart3 />
              Lihat Jawaban
            </Link>
          </Button>
          <Button asChild variant="danger" size="sm">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (data.isLoading || data.isError) {
    return (
      <div className="border-2 border-foreground bg-paper">
        <LoadData response={data.pageState} minHeight="40vh" />
        {data.isError ? (
          <div className="flex justify-center pb-10">
            <Button onClick={() => fetchFormsDetail.refetch()}>Coba Lagi</Button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <form onSubmit={submitResponses} className="border-2 border-foreground">
      {data.hasBanner && data.image ? (
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

      <SectionHead
        tag="SECTION 01"
        size="content"
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
              value={filters.name}
              placeholder="Type your answer"
              onChange={(event) =>
                editRespondent('name', event.target.value)
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
              value={filters.email}
              placeholder="Type your answer"
              onChange={(event) => editRespondent('email', event.target.value)}
            />
          </div>
        </div>
      </div>

      <LoadData
        response={data.questionState}
        className="border-b-2 border-foreground bg-paper"
      >
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
      </LoadData>

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
