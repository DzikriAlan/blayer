'use client'

import { createContext, useContext, useMemo, useState } from 'react'

import { LANDING_COPY, type LandingLocale } from './landingCatalog'

interface LandingLocaleValue {
  locale: LandingLocale
  setLocale: (locale: LandingLocale) => void
}

const LandingLocaleContext = createContext<LandingLocaleValue | null>(null)

export function LandingLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<LandingLocale>('id')
  const value = useMemo(() => ({ locale, setLocale }), [locale])

  return (
    <LandingLocaleContext.Provider value={value}>
      {children}
    </LandingLocaleContext.Provider>
  )
}

export function useLandingLocale() {
  const ctx = useContext(LandingLocaleContext)
  if (!ctx) {
    throw new Error('useLandingLocale harus dipakai di dalam LandingLocaleProvider')
  }
  return ctx
}

export function useLandingCopy() {
  const { locale } = useLandingLocale()
  return LANDING_COPY[locale]
}
