'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import type { DataResponsesListItem } from '../types/responsesTypes'
import { useResponsesStates } from '../states/responsesStates'
import { useResponsesControllers } from '../controllers/responsesControllers'

import { Button } from '@/components/ui/button'
import SectionHead from '@/components/section-head'
import { LoadData } from '@/shared/components/load-data'
import ResponsesDashboard from './responsesDashboard'

interface Props {
  formId: string
}

export default function ResponsesResult({ formId }: Props) {
  const { responsesList, setGetResponsesList } = useResponsesStates()
  const { fetchResponsesList } = useResponsesControllers()

  const data = useMemo(() => {
    const getMappedResponse = (item: DataResponsesListItem) => ({
      id: item.id,
      name: item.name || 'Anonim',
      email: item.email,
      answers: item.answers,
      duration: item.duration,
      createdAt: item.createdAt,
    })

    const rawResponses = responsesList.data?.responses ?? []
    const mappedList = rawResponses.map(getMappedResponse)

    return {
      data: mappedList,
      isLoading: responsesList.status === 'loading',
      isError: responsesList.status === 'error',
      isEmpty: responsesList.status === 'empty',
      emptyTitle: 'No Responses Yet',
      emptySubtitle:
        'Bagikan link form ini terlebih dahulu. Jawaban yang masuk akan muncul di sini.',
      emptyImage: '/no-data.svg',
      errorTitle: 'Something Broke',
      errorSubtitle: responsesList.statusSubtitle,
      errorImage: '/no-data.svg',
      pagination: { currentPage: 1, perPage: mappedList.length },
      title: responsesList.data?.title ?? 'Results',
      templateId: responsesList.data?.templateId ?? '',
      rawFields: responsesList.data?.fields ?? [],
      rawResponses,
      totalResponses: rawResponses.length,
    }
  }, [responsesList])

  const loadResponsesList = () => {
    fetchResponsesList.refetch()
  }

  useEffect(() => {
    if (!formId) return
    setGetResponsesList({ formId })
  }, [formId, setGetResponsesList])

  return (
    <div className="flex flex-col gap-8">
      <section className="border-2 border-foreground bg-paper">
        <SectionHead
          tag="RESULTS"
          size="content"
          title={data.title}
          className="px-5 pt-6 sm:px-7"
        />
      </section>

      <LoadData response={data} minHeight="30vh">
        {data.totalResponses > 0 ? (
          <ResponsesDashboard
            title={data.title}
            templateId={data.templateId}
            fields={data.rawFields}
            responses={data.rawResponses}
          />
        ) : null}
      </LoadData>

      {data.isError ? (
        <div className="flex justify-center">
          <Button onClick={loadResponsesList}>Retry</Button>
        </div>
      ) : null}

      {data.isEmpty ? (
        <div className="flex justify-center">
          <Button asChild>
            <Link href={`/forms/${formId}`}>
              Open Form <ArrowRight />
            </Link>
          </Button>
        </div>
      ) : null}

      <Button asChild variant="danger" size="sm" className="self-start">
        <Link href="/">
          <ArrowLeft /> All Forms
        </Link>
      </Button>
    </div>
  )
}
