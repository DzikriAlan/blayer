'use client'

import { cn } from '@/shared/lib/utils'
import { useLandingLocale } from './landingLocaleContext'
import type { LandingLocale } from './landingCatalog'

const OPTIONS: LandingLocale[] = ['id', 'en']

export default function LandingLocaleToggle() {
  const { locale, setLocale } = useLandingLocale()

  return (
    <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
      {OPTIONS.map((option, index) => (
        <div key={option} className="flex items-center gap-1">
          {index > 0 && <span className="text-neutral-300">/</span>}
          <button
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={locale === option}
            className={cn(
              'transition-colors',
              locale === option
                ? 'text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-600',
            )}
          >
            {option}
          </button>
        </div>
      ))}
    </div>
  )
}
