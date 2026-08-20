'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'

import type {
  DataAnalysisRanking,
  PayloadPostAnalysis,
} from '../types/analysisTypes'
import { useAnalysisStates } from '../states/analysisStates'
import { useAnalysisControllers } from '../controllers/analysisControllers'
import { useResponsesStates } from '@/features/responses/states/responsesStates'
import { useResponsesControllers } from '@/features/responses/controllers/responsesControllers'

import { IS_AI_VISIBLE } from '@/shared/lib/features'
import { Button } from '@/components/ui/button'
import SectionHead from '@/components/section-head'
import { LoadData } from '@/shared/components/load-data'
import ResponsesDashboard from '@/features/responses/components/responsesDashboard'
import AnalysisRankingCard from './analysisRankingCard'

interface Props {
  formId: string
}

export default function AnalysisResult({ formId }: Props) {
  const { responsesList, setGetResponsesList } = useResponsesStates()
  const { fetchResponsesList } = useResponsesControllers()
  const { analysis, setGetAnalysis, setPostAnalysis } = useAnalysisStates()
  const { storeAnalysis } = useAnalysisControllers()

  const data = useMemo(() => {
    const getMappedRanking = (item: DataAnalysisRanking, index: number) => ({
      responseId: item.responseId,
      rank: item.rank || index + 1,
      respondentName: item.respondentName || 'Anonim',
      score: item.score,
      verdict: item.verdict,
      strengths: item.strengths ?? [],
      concerns: item.concerns ?? [],
      reasoning: item.reasoning,
      isTop: (item.rank || index + 1) === 1,
    })

    const rankingList = (analysis.data?.ranking ?? []).map((raw, index) =>
      getMappedRanking(raw, index)
    )

    const isAiEnabled =
      IS_AI_VISIBLE && (responsesList.data?.isAiEnabled ?? false)
    const rawResponses = responsesList.data?.responses ?? []

    return {
      data: rankingList,
      isAiEnabled,
      isLoading: responsesList.status === 'loading',
      isError: responsesList.status === 'error',
      isEmpty: responsesList.status === 'empty',
      emptyTitle: 'No Responses Yet',
      emptySubtitle: isAiEnabled
        ? 'Bagikan link form ini terlebih dahulu. AI baru bisa menganalisis setelah ada jawaban yang masuk.'
        : 'Bagikan link form ini terlebih dahulu. Jawaban yang masuk akan muncul di sini.',
      emptyImage: '/no-data.svg',
      errorTitle: 'Something Broke',
      errorSubtitle: responsesList.statusSubtitle,
      errorImage: '/no-data.svg',
      pagination: { currentPage: 1, perPage: rawResponses.length },
      formTitle: responsesList.data?.formTitle ?? 'Results',
      purpose: responsesList.data?.purpose ?? '',
      templateId: responsesList.data?.templateId ?? '',
      rawFields: responsesList.data?.fields ?? [],
      rawResponses,
      totalResponse: rawResponses.length,
      isAnalyzing: storeAnalysis.isPending || analysis.status === 'loading',
      isAnalyzed: analysis.status === 'success' && !!analysis.data,
      analysisError: analysis.status === 'error' ? analysis.statusSubtitle : '',
      summary: analysis.data?.summary ?? '',
      recommendation: analysis.data?.recommendation ?? '',
    }
  }, [analysis, responsesList, storeAnalysis.isPending])

  const submitAnalysis = () => {
    const payload: PayloadPostAnalysis = { formId }
    setPostAnalysis(payload)
    storeAnalysis.mutate(payload)
  }

  useEffect(() => {
    if (!formId) return
    setGetResponsesList({ formId })
    setGetAnalysis({ formId })
  }, [formId, setGetResponsesList, setGetAnalysis])

  return (
    <div className="flex flex-col gap-8">
      <section className="border-2 border-foreground bg-paper">
        <SectionHead
          tag="RESULTS"
        size="content"
          title={data.formTitle}
          className="px-5 pt-6 sm:px-7"
        />

        {IS_AI_VISIBLE && data.purpose ? (
          <div className="px-5 py-5 sm:px-7">
            <p className="brutal-eyebrow text-primary">AI TARGET</p>
            <p className="mt-2.5 font-mono text-sm leading-relaxed">
              {data.purpose}
            </p>
          </div>
        ) : null}
      </section>

      <LoadData response={data} minHeight="30vh">
        {data.totalResponse > 0 ? (
          <ResponsesDashboard
            formTitle={data.formTitle}
            templateId={data.templateId}
            fields={data.rawFields}
            responses={data.rawResponses}
          />
        ) : null}
      </LoadData>

      {data.isError ? (
        <div className="flex justify-center">
          <Button onClick={() => fetchResponsesList.refetch()}>Retry</Button>
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

      {data.isAiEnabled && data.totalResponse > 0 ? (
        <section className="border-2 border-foreground">
          <div className="border-b-2 border-foreground bg-primary px-5 py-8 text-primary-foreground sm:px-7">
            <div className="flex items-stretch gap-3">
              <span className="brutal-eyebrow bg-foreground px-3 py-2 text-primary">
                CLAUDE OPUS
              </span>
              <span aria-hidden className="brutal-hatch flex-1 opacity-40" />
            </div>

            <h2 className="mt-5 font-display text-[clamp(2rem,6vw,3.5rem)] font-black uppercase leading-[0.88] tracking-[-0.03em]">
              Let AI
              <br />
              call it
              <span className="text-foreground">.</span>
            </h2>

            <p className="mt-4 max-w-md font-mono text-sm leading-relaxed">
              AI membaca seluruh jawaban, menilainya terhadap tujuan form, lalu
              memberi peringkat beserta alasannya.
            </p>

            <Button
              variant="paper"
              size="lg"
              className="mt-7"
              disabled={data.isAnalyzing}
              onClick={submitAnalysis}
            >
              {data.isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" /> Analyzing
                </>
              ) : (
                <>
                  {data.isAnalyzed ? 'Re-run Analysis' : 'Run Analysis'}{' '}
                  <ArrowRight />
                </>
              )}
            </Button>
          </div>

          {data.analysisError ? (
            <p className="brutal-eyebrow border-b-2 border-foreground bg-foreground px-7 py-4 text-primary">
              {data.analysisError}
            </p>
          ) : null}

          {data.isAnalyzed ? (
            <>
              <div className="border-b-2 border-foreground bg-paper px-5 py-6 sm:px-7">
                <p className="brutal-eyebrow text-primary">SUMMARY</p>
                <p className="mt-3 font-mono text-sm leading-relaxed">
                  {data.summary}
                </p>
              </div>

              <div className="border-b-2 border-foreground bg-foreground px-5 py-6 text-background sm:px-7">
                <p className="brutal-eyebrow text-primary">FINAL CALL</p>
                <p className="mt-3 font-mono text-sm leading-relaxed">
                  {data.recommendation}
                </p>
              </div>

              <div className="border-b-2 border-foreground bg-muted px-5 py-4 sm:px-7">
                <p className="brutal-eyebrow">RANKING</p>
              </div>

              {data.data.map((item) => (
                <AnalysisRankingCard
                  key={item.responseId}
                  rank={item.rank}
                  respondentName={item.respondentName}
                  score={item.score}
                  verdict={item.verdict}
                  strengths={item.strengths}
                  concerns={item.concerns}
                  reasoning={item.reasoning}
                  isTop={item.isTop}
                />
              ))}
            </>
          ) : null}
        </section>
      ) : null}

      <Button asChild variant="danger" size="sm" className="self-start">
        <Link href="/">
          <ArrowLeft /> All Forms
        </Link>
      </Button>
    </div>
  )
}
