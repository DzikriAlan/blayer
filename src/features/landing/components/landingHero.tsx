'use client'

import Image from 'next/image'

import { cn } from '@/shared/lib/utils'
import flowIcons from '@/shared/images/flow-icons.png'
import { useLandingCopy } from './landingLocaleContext'

export default function LandingHero() {
  const copy = useLandingCopy()
  const columnCount = copy.overview.length
  const rowCount = Math.max(...copy.overview.map((column) => column.items.length))

  return (
    <section id="tentang" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-5 pb-8 pt-16 sm:px-8 sm:pb-6 sm:pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          {copy.eyebrow}
        </p>

        <h1 className="mt-3 max-w-3xl text-balance text-4xl font-extrabold leading-[1.15] tracking-tight text-neutral-900 sm:text-5xl">
          {copy.headlinePrefix}{' '}
          <span className="text-blue-600">{copy.headlineHighlight}</span>
          {copy.headlineSuffix}
        </h1>
      </div>

      <div className="mb-8 overflow-x-auto px-5 sm:mb-6 sm:overflow-visible sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Image
            src={flowIcons}
            alt="Alur kerja Blayer: brief, spreadsheet, code, testing, report"
            className="h-auto w-[233.34vw] max-w-none sm:w-full"
            sizes="(min-width: 1152px) 1152px, 100vw"
          />
        </div>
      </div>

      <div id="manfaat" className="scroll-mt-20 overflow-x-auto">
        <div
          className="mx-auto grid w-full max-w-6xl min-w-[640px] sm:min-w-0"
          style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
        >
          {copy.overview.map((column, colIndex) => (
            <p
              key={`title-${column.id}`}
              id={colIndex === columnCount - 1 ? 'untuk-siapa' : undefined}
              className={cn(
                'scroll-mt-20 px-5 pb-4 pt-6 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 sm:px-6 sm:pt-4',
                colIndex > 0 && 'border-l border-neutral-200',
              )}
            >
              {column.title}
            </p>
          ))}

          {Array.from({ length: rowCount }).map((_, rowIndex) =>
            copy.overview.map((column, colIndex) => (
              <p
                key={`${column.id}-${rowIndex}`}
                className={cn(
                  'px-5 pb-3 text-sm leading-relaxed text-neutral-600 sm:px-6 sm:pb-2',
                  colIndex > 0 && 'border-l border-neutral-200',
                  rowIndex === rowCount - 1 && 'pb-6 sm:pb-6',
                )}
              >
                {column.items[rowIndex] ?? ''}
              </p>
            )),
          )}
        </div>
      </div>
    </section>
  )
}
