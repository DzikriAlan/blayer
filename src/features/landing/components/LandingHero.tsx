import Image from 'next/image'
import blayerLogo from '@/shared/assets/blayer-logo.png'
import { Bot, Zap, Globe, Linkedin, Github } from 'lucide-react'
import LandingCodeTabs from './LandingCodeTabs'

const features = [
  {
    icon: <Bot className="h-4 w-4 text-primary" />,
    title: 'AI Code Generation',
    description: 'Generate repetitive code instantly',
  },
  {
    icon: <Zap className="h-4 w-4 text-primary" />,
    title: '40% Less Repetitive Work',
    description: 'Focus on solving real problems',
  },
  {
    icon: <Globe className="h-4 w-4 text-primary" />,
    title: 'Built for Modern Stack',
    description: "Seamlessly integrates with today's development tools",
  },
]

interface LandingHeroProps {
  readonly codeSnippets: Record<string, string>
}

export default function LandingHero({ codeSnippets }: LandingHeroProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-14 pb-14 md:pb-20 md:px-6">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />

      {/* Center glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-foreground/5 blur-[120px]" />
      </div>

      {/* Corner dots */}
      <div className="pointer-events-none absolute top-24 left-8 hidden lg:grid grid-cols-4 gap-2">
        {['a1','a2','a3','a4','b1','b2','b3','b4','c1','c2','c3','c4','d1','d2','d3','d4'].map((id) => (
          <span key={id} className="h-1 w-1 rounded-full bg-foreground/15" />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-24 left-8 hidden lg:grid grid-cols-4 gap-2">
        {['e1','e2','e3','e4','f1','f2','f3','f4','g1','g2','g3','g4','h1','h2','h3','h4'].map((id) => (
          <span key={id} className="h-1 w-1 rounded-full bg-foreground/15" />
        ))}
      </div>

      {/* Main content */}
      <div className="relative mx-auto w-full max-w-6xl">
        {/* Two-column layout */}
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-16">

          {/* Left — headline + features + CTA */}
          <div className="flex-1 w-full">
            {/* Headline — centered on mobile, left on desktop */}
            <div className="text-center lg:text-left mb-4">
              <h1 className="font-bold tracking-tight text-foreground">
                <span className="flex items-center gap-3 text-4xl sm:text-5xl lg:text-6xl justify-center lg:justify-start">
                  <Image
                    src={blayerLogo}
                    alt="Blayer"
                    height={60}
                    className="h-9 sm:h-12 lg:h-[3.75rem] w-auto select-none brightness-0 dark:invert"
                  />
                  Blayer
                </span>
                <span className="block text-3xl sm:text-4xl lg:text-5xl text-muted-foreground mt-1">
                  Handle repetitive code, ship features 40% faster
                </span>
              </h1>
            </div>

            <p className="mb-6 text-rem-95 text-muted-foreground leading-relaxed text-center lg:text-left max-w-md mx-auto lg:mx-0">
              Eliminate repetitive coding with AI-powered generation, helping developers reduce repetitive work by up to <strong>40%</strong> and focus on building impactful features.
            </p>

            {/* Mobile marquee — features row, hidden on desktop */}
            <div className="lg:hidden mb-6">
              <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 z-10 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-background to-transparent" />
                <div
                  className="flex gap-2 w-max"
                  style={{ animation: 'marquee 22s linear infinite' }}
                >
                  {[...features, ...features].map((feat, i) => (
                    <div
                      key={i}
                      className="shrink-0 flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        {feat.icon}
                      </div>
                      <span className="whitespace-nowrap text-rem-85 font-medium text-foreground">{feat.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop features grid — hidden on mobile */}
            <div className="hidden lg:grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
              {features.map((feat) => (
                <div key={feat.title} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {feat.icon}
                  </div>
                  <div>
                    <p className="text-rem-90 font-semibold text-foreground leading-tight">{feat.title}</p>
                    <p className="text-rem-80 text-muted-foreground leading-snug">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA buttons — stacked full-width on mobile, row on sm+ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 max-w-sm sm:max-w-none mx-auto lg:mx-0">
              <a
                href="https://www.linkedin.com/in/dzikri-alan/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-rem-95 font-semibold text-foreground hover:bg-muted/60 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href="https://github.com/DzikriAlan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-rem-95 font-semibold text-foreground hover:bg-muted/60 transition-colors"
              >
                <Github className="h-4 w-4" />
                Github
              </a>
            </div>
          </div>

          {/* Right — Code tabs */}
          <LandingCodeTabs codeSnippets={codeSnippets} />

        </div>
      </div>
    </section>
  )
}
