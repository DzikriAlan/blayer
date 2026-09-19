import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { MessageCircle, ArrowDown } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { GoogleIcon } from './LandingIcons'
import { GridBackdrop, GrainOverlay, HalftoneOrb } from './LandingDecor'
import LandingDashboard from './LandingDashboard'

export default function LandingHero() {
  const { data: session, status } = useSession()
  const isCheckingSession = status === 'loading'
  const router = useRouter()

  function handleCta() {
    if (session) router.push('/home')
    else signIn('google', { callbackUrl: '/home' })
  }

  const renderCtaIcon = () => {
    if (isCheckingSession) return <span className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-primary-foreground/30" />
    if (session) return <MessageCircle className="h-4 w-4" />
    return <GoogleIcon />
  }

  return (
    <section id="top" className="relative overflow-hidden px-4 pb-16 pt-8 md:px-6 md:pb-24 md:pt-12">
      <GridBackdrop />
      <GrainOverlay />

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Hero panel — orb top-right, headline left, demo clipped at the bottom */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
          <HalftoneOrb className="-right-20 -top-24 h-[320px] w-[320px] sm:-right-16 sm:h-[420px] sm:w-[420px] lg:h-[520px] lg:w-[520px]" />

          <div className="relative px-6 pt-10 md:px-12 md:pt-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-rem-75 font-medium text-muted-foreground backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
Open source · MIT · self-hosted
            </span>

            <h1 className="mt-6 max-w-[16ch] font-gudlak text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Build excellent AI agents,
              <br />
              <span className="text-iris">your way.</span>
            </h1>

            <p className="mt-5 max-w-md text-rem-95 leading-relaxed text-muted-foreground">
              Write what the agent should know and where it should stop. Blayer turns that into a teammate who
              answers on your site at 3am and hands off when it should not guess.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                size="lg"
                onClick={handleCta}
                className="gap-2 px-6 text-rem-95 font-semibold"
              >
                {renderCtaIcon()}
                {isCheckingSession ? (
                  <span className="h-4 w-40 max-w-full animate-pulse rounded bg-primary-foreground/30" />
                ) : (
                  session ? 'Open your console' : 'Build your first agent'
                )}
              </Button>
              <a
                href="#agents"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-2 text-rem-95 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <ArrowDown className="h-4 w-4" />
                See what it answers
              </a>
            </div>
          </div>

          {/* Product shot — a live console, deliberately clipped by the panel edge */}
          <div className="relative mt-8 ml-4 translate-y-6 sm:ml-6 md:ml-12 md:translate-y-8 lg:ml-24">
            <LandingDashboard />
          </div>
        </div>

        {/* Lede — left-aligned against a rule, not another centred paragraph */}
        <div className="mt-14 grid gap-4 border-t border-border pt-8 md:mt-20 md:grid-cols-12 md:gap-8">
          <p className="text-rem-70 font-medium uppercase tracking-[0.18em] text-muted-foreground md:col-span-3">
            What it is
          </p>
          <p className="max-w-2xl text-rem-110 leading-relaxed text-foreground md:col-span-9 md:text-rem-130">
            A Next.js app you run yourself. Agents live in your Postgres, replies stream from your OpenAI key, and
            the widget is one script tag with no React on the host page. Built by{' '}
            <span className="text-iris">Dzikri Alan</span> — MIT, no seat count, no usage meter.
          </p>
        </div>
      </div>
    </section>
  )
}
