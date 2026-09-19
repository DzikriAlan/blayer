import Image from 'next/image'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Github, Linkedin } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { HalftoneOrb, Reveal } from './LandingDecor'
import { SectionHead } from './LandingSection'
import { GoogleIcon } from './LandingIcons'
import blayerLogo from '@/shared/assets/blayer.png'

const GITHUB_URL = 'https://github.com/DzikriAlan/blayer'
const LINKEDIN_URL = 'https://www.linkedin.com/in/dzikri-alan/'

/* A definition list, not three matching cards. These are four flat facts of
   different lengths; forcing them into equal boxes would have been decoration
   pretending to be structure. */
const FACTS = [
  { term: 'Licence', detail: 'MIT. Fork it, rebrand it, sell what you build on it. No seat count, no usage meter, no phone-home.' },
  { term: 'Where it runs', detail: 'Your Vercel project, your Postgres, your OpenAI key. Blayer has no servers of its own to send anything to.' },
  { term: 'Who wrote it', detail: 'Dzikri Alan, in the open — commits, issues and the mistakes in between all readable on GitHub.' },
  { term: 'What it is not', detail: 'Not a hosted SaaS, not a no-code flow builder, and not something with a support SLA. It is a codebase you run.' },
]

export default function LandingFooter() {
  const { data: session, status } = useSession()
  const isCheckingSession = status === 'loading'
  const router = useRouter()

  function handleCta() {
    if (session) router.push('/home')
    else signIn('google', { callbackUrl: '/home' })
  }

  return (
    <footer className="relative px-4 pb-10 pt-16 md:px-6 md:pt-24">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHead
          index="06"
          kicker="The terms"
          title="Nothing here is rented."
          variant="left"
        />

        <Reveal variant="unroll" className="mb-6">
          <dl className="divide-y divide-border border-y border-border">
            {FACTS.map((fact) => (
              <div key={fact.term} className="grid gap-1 py-4 md:grid-cols-12 md:gap-8">
                <dt className="text-rem-70 font-medium uppercase tracking-[0.18em] text-muted-foreground md:col-span-3">
                  {fact.term}
                </dt>
                <dd className="max-w-2xl text-rem-90 leading-relaxed text-foreground md:col-span-9">
                  {fact.detail}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Closing panel — the orb bookends the hero, which is the one repeated
            motif the page keeps on purpose. */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
          <HalftoneOrb className="-bottom-40 -right-24 h-[320px] w-[320px] md:-bottom-48 md:h-[440px] md:w-[440px]" />
          <div className="relative px-5 py-12 sm:px-8 md:px-12 md:py-16">
            <h2 className="max-w-lg font-gudlak text-rem-160 font-bold leading-tight tracking-tight text-foreground sm:text-[2rem] md:text-[2.4rem]">
              Write the paragraph.
            </h2>
            <p className="mt-3 max-w-md text-rem-95 leading-relaxed text-muted-foreground">
              Sign in, describe the job in a few sentences, and test the agent in the preview pane before it ever
              touches your site.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                size="lg"
                onClick={handleCta}
                className="gap-2 px-6 text-rem-95 font-semibold"
              >
                {isCheckingSession
                  ? <span className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-primary-foreground/30" />
                  : <GoogleIcon />}
                {session ? 'Open your console' : 'Build your first agent'}
              </Button>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-2 text-rem-95 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Github className="h-4 w-4" />
                Read the source
              </a>
            </div>
          </div>
        </div>

        {/* Colophon */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src={blayerLogo}
              alt="Blayer"
              height={20}
              className="h-4 w-auto select-none brightness-0 dark:invert"
            />
            <span className="text-rem-80 text-muted-foreground">Built by Dzikri Alan · MIT licensed</span>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
