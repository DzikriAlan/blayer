'use client'

import { ChevronDown, Trophy } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

export interface ResponsesScoreAnswer {
  fieldId: string
  label: string
  value: string
}

interface Props {
  id: string
  rank: number
  respondentName: string
  respondentEmail: string
  createdAt: string
  score: number
  showScore: boolean
  answers: ResponsesScoreAnswer[]
  isTop: boolean
  isOpen: boolean
  onLoadDetail: (id: string) => void
}

export default function ResponsesScoreRow({
  id,
  rank,
  respondentName,
  respondentEmail,
  createdAt,
  score,
  showScore,
  answers,
  isTop,
  isOpen,
  onLoadDetail,
}: Props) {
  const panelId = `respondent-detail-${id}`
  const isHighlighted = isTop && showScore

  return (
    <article
      className={cn(
        'border-b-2 border-foreground',
        isHighlighted ? 'bg-primary text-primary-foreground' : 'bg-paper'
      )}
    >
      <button
        type="button"
        onClick={() => onLoadDetail(id)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cn(
          'flex w-full items-center gap-4 px-5 py-5 text-left transition-colors sm:gap-6 sm:px-7',
          isHighlighted ? 'hover:bg-primary/90' : 'hover:bg-muted'
        )}
      >
        <span
          className={cn(
            'brutal-index h-11 w-11 text-base',
            isHighlighted && 'bg-foreground text-primary'
          )}
        >
          {String(rank).padStart(2, '0')}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 break-words font-display text-xl font-black uppercase leading-none tracking-tight">
            {respondentName}
            {isHighlighted ? <Trophy className="h-4 w-4 shrink-0" /> : null}
          </h3>
          <p className="brutal-eyebrow mt-2 break-words opacity-70">
            {respondentEmail ? `${respondentEmail} · ` : ''}
            {createdAt}
          </p>
        </div>

        {showScore ? (
          <div className="shrink-0 text-right">
            <p className="font-display text-3xl font-black leading-none sm:text-4xl">
              {score}
            </p>
            <p className="brutal-eyebrow mt-1">/ 100</p>
          </div>
        ) : null}

        <ChevronDown
          aria-hidden
          className={cn(
            'h-5 w-5 shrink-0 transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen ? (
        <div
          id={panelId}
          className="border-t-2 border-dashed border-current bg-paper px-5 py-6 text-foreground sm:px-7"
        >
          <p className="brutal-eyebrow text-muted-foreground">
            JAWABAN LENGKAP
          </p>
          <dl className="mt-4 grid gap-4">
            {answers.map((answer) => (
              <div
                key={answer.fieldId}
                className="border-l-2 border-primary pl-4"
              >
                <dt className="brutal-eyebrow break-words text-muted-foreground">
                  {answer.label}
                </dt>
                <dd className="mt-1.5 whitespace-pre-line break-words font-mono text-sm leading-relaxed">
                  {answer.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </article>
  )
}
