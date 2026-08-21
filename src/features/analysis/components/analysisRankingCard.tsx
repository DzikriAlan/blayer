'use client'

import { cn } from '@/shared/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Props {
  rank: number
  name: string
  score: number
  verdict: string
  strengths: string[]
  concerns: string[]
  reasoning: string
  isTop: boolean
}

export default function AnalysisRankingCard({
  rank,
  name,
  score,
  verdict,
  strengths,
  concerns,
  reasoning,
  isTop,
}: Props) {
  const barWidth = Math.min(Math.max(score, 0), 100)

  return (
    <article
      className={cn(
        'flex gap-4 border-b-2 border-foreground px-5 py-6 sm:gap-6 sm:px-7',
        isTop ? 'bg-primary text-primary-foreground' : 'bg-paper'
      )}
    >
      <span
        className={cn(
          'brutal-index h-11 w-11 text-base',
          isTop && 'bg-foreground text-primary'
        )}
      >
        {String(rank).padStart(2, '0')}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="break-words font-display text-2xl font-black uppercase leading-none tracking-tight">
              {name}
            </h3>
            <Badge
              variant={isTop ? 'secondary' : 'outline'}
              className="mt-2.5"
            >
              {verdict}
            </Badge>
          </div>

          <div className="text-right">
            <p className="font-display text-5xl font-black leading-none">
              {score}
            </p>
            <p className="brutal-eyebrow mt-1">/ 100</p>
          </div>
        </div>

        <div
          className={cn(
            'mt-5 h-3 w-full border-2',
            isTop ? 'border-foreground bg-primary' : 'border-foreground bg-muted'
          )}
        >
          <div
            className={cn('h-full', isTop ? 'bg-foreground' : 'bg-primary')}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        <p className="mt-5 font-mono text-sm leading-relaxed">{reasoning}</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="brutal-eyebrow border-b-2 border-current pb-2">
              + STRENGTHS
            </p>
            <ul className="mt-3 space-y-2">
              {strengths.map((item) => (
                <li key={item} className="font-mono text-xs leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="brutal-eyebrow border-b-2 border-current pb-2">
              — CONCERNS
            </p>
            <ul className="mt-3 space-y-2">
              {concerns.map((item) => (
                <li key={item} className="font-mono text-xs leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  )
}
