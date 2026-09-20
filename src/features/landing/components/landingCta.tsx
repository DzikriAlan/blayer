import Link from 'next/link'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LANDING_PROPERTIES } from './landingCatalog'

export default function LandingCta() {
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        Build Excellent AI Agent,{' '}
        <span className="text-primary">Your Way.</span>
      </h2>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/console">Masuk Console</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/docs/self-hosting">Jalankan sendiri</Link>
        </Button>
      </div>

      <ul className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {LANDING_PROPERTIES.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Check className="h-3.5 w-3.5 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
