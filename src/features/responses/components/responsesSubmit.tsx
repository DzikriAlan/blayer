'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BarChart3, Loader2 } from 'lucide-react'

import type { PayloadPostResponses } from '../types/responsesTypes'
import { useResponsesStates } from '../states/responsesStates'
import { useResponsesControllers } from '../controllers/responsesControllers'
import { useFormsStates } from '@/features/forms/states/formsStates'
import { useFormsControllers } from '@/features/forms/controllers/formsControllers'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import SectionHead from '@/components/section-head'
import StatusView from '@/components/status-view'
import ResponsesField from './responsesField'

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
  })

  const data = useMemo(() => {
    const getAnswer = (fieldId: string) => filters.answers[fieldId] ?? ''

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

    const payload: PayloadPostResponses = {
      formId,
      respondentName: filters.respondentName,
      respondentEmail: filters.respondentEmail,
      answers: filters.answers,
    }

    storeResponses.mutate(payload)
  }

  useEffect(() => {
    if (formId) setGetFormsDetail({ id: formId })
  }, [formId, setGetFormsDetail])

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
    <form onSubmit={submitResponses} className="border-2 border-foreground">
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
