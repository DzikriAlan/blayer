import Image from 'next/image'
import { Github, Linkedin } from 'lucide-react'
import ThemeToggle from '@/shared/components/ThemeToggle'
import blayerLogo from '@/shared/assets/blayer.png'

const GITHUB_URL = 'https://github.com/DzikriAlan/blayer'
const LINKEDIN_URL = 'https://www.linkedin.com/in/dzikri-alan/'

/* In-page anchors only — /home and /agents are behind AuthGuard, so linking
   them from a logged-out landing page would just bounce back to here. */
const sections = [
  { label: 'How it works', href: '#agents' },
  { label: 'The gap', href: '#coverage' },
  { label: 'Under it', href: '#engineering' },
  { label: 'Embed', href: '#embed' },
]

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-12 w-full max-w-6xl items-center gap-4 px-4 md:px-6">
        <a href="#top" className="flex shrink-0 items-center gap-2">
          <Image
            src={blayerLogo}
            alt="Blayer"
            height={22}
            className="h-[18px] w-auto select-none brightness-0 dark:invert"
          />
          <span className="font-gudlak text-rem-95 font-semibold tracking-tight text-foreground">Blayer</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {sections.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-rem-85 text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
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
          <ThemeToggle collapsed />
        </div>
      </nav>
    </header>
  )
}
