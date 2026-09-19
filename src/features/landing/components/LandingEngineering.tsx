import { SectionHead, BentoCard } from './LandingSection'
import { HalftoneWash } from './LandingDecor'
import { techStack } from './LandingIcons'
import WindowCard from './LandingWindow'

const modules = [
  { name: 'features/agent',  desc: 'CRUD, generated personas, avatar upload' },
  { name: 'features/chat',   desc: 'SSE streaming, history, rename, delete' },
  { name: 'features/landing', desc: 'this page' },
  { name: 'pages/api',       desc: 'route handlers — no separate backend' },
  { name: 'public/widget.js', desc: '2 KB loader, zero dependencies' },
]

const RUNBOOK = `DATABASE_URL=postgresql://…
OPENAI_API_KEY=sk-…

npm run db:push
npm run build`

const AGENT_SNIPPET = `// src/features/agent/services/agentServices.ts
export async function postAgent(payload: PayloadPostAgent) {
  const res = await fetch('/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json() as Promise<ResponseAgent>
}`

const EMBED_SNIPPET = `<script
  src="https://your-site.com/widget.js"
  data-agent="agt_8fc31b"
  data-color="#9333EA"
  defer
></script>`

interface SnippetProps {
  label: string
  code: string
}

function Snippet({ label, code }: Readonly<SnippetProps>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="border-b border-border px-3 py-2 sm:px-4">
        <span className="font-mono text-rem-65 text-muted-foreground sm:text-rem-70">{label}</span>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-rem-70 leading-relaxed text-foreground sm:p-4 sm:text-rem-75">
        <code>{code}</code>
      </pre>
    </div>
  )
}

/* The four notes below deliberately take four different shapes — a file list, a
   code block, a plain statement, a count plus a grid. Four icon-chip-plus-
   paragraph cards would have said the same thing in the voice of every
   generated landing page on the internet. */

export default function LandingEngineering() {
  return (
    <>
      <section id="engineering" className="relative px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHead
            index="04"
            kicker="Under it"
            title="Boring on purpose."
            subtitle="No framework of ours to learn. Feature folders, typed services, and a deploy you can read in four lines."
            variant="left"
          />

          {/* The banner carries the actual runbook — a large gradient header
              with nothing behind it is the thing we are avoiding. */}
          <BentoCard className="mb-4 p-0" variant="clip">
            <HalftoneWash surface="card" fade="down" grid="fine" />
            <div className="relative grid gap-6 px-5 py-8 sm:px-8 md:grid-cols-2 md:items-center md:px-10 md:py-12">
              <div>
                <p className="font-gudlak text-rem-140 font-bold leading-tight text-orchid-800 dark:text-brand-50 sm:text-rem-160 md:text-[2rem]">
                  Two secrets, two commands.
                </p>
                <p className="mt-2 max-w-md text-rem-85 leading-relaxed text-orchid-800/80 dark:text-brand-50/80 sm:text-rem-90">
                  Frontend, API routes, streaming and the widget ship in the same repo. This is the entire
                  deployment procedure — there is no second service to stand up.
                </p>
              </div>
              <Snippet label=".env.local" code={RUNBOOK} />
            </div>
          </BentoCard>

          <WindowCard title="blayer — architecture" padded={false}>
            <div className="grid lg:grid-cols-2">
              {/* 1 — a file list, titled as a path */}
              <section className="border-b border-border p-5 lg:border-r">
                <h3 className="font-mono text-rem-80 font-medium text-iris">src/features/*</h3>
                <p className="mt-1.5 text-rem-80 leading-relaxed text-muted-foreground">
                  Each domain owns its types, states, services and controllers. Nothing reaches across a folder
                  boundary, so deleting a feature is deleting a directory.
                </p>
                <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {modules.map((mod) => (
                    <li key={mod.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 bg-background px-3 py-2.5 sm:px-4">
                      <span className="font-mono text-rem-75 font-medium text-foreground sm:text-rem-80">{mod.name}</span>
                      <span className="text-rem-70 text-muted-foreground">{mod.desc}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 2 — the code is the argument; the label just names it */}
              <section className="border-b border-border p-5">
                <h3 className="text-rem-70 font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  One shape for every call
                </h3>
                <div className="mt-3">
                  <Snippet label="agentServices.ts" code={AGENT_SNIPPET} />
                </div>
                <p className="mt-3 text-rem-80 leading-relaxed text-muted-foreground">
                  Services own the fetch, controllers own the cache, components own the pixels. Every endpoint in
                  the app is written exactly like this one.
                </p>
              </section>

              {/* 3 — a plain statement, set large. No icon, no card. */}
              <section className="border-b border-border p-5 lg:border-b-0 lg:border-r">
                <p className="text-rem-110 leading-relaxed text-foreground sm:text-rem-120">
                  Your agents, sessions and transcripts sit in{' '}
                  <span className="text-iris">your own Postgres</span>. Prisma schema, ordinary migrations,
                  no proprietary store in the middle.
                </p>
                <p className="mt-3 text-rem-80 text-muted-foreground">
                  Supabase, Neon, RDS, or a container on your laptop — Blayer does not care which.
                </p>
              </section>

              {/* 4 — the count is the heading */}
              <section className="p-5">
                <h3 className="flex items-baseline gap-2">
                  <span className="font-gudlak text-rem-160 font-bold leading-none text-foreground">{techStack.length}</span>
                  <span className="text-rem-85 text-muted-foreground">load-bearing dependencies</span>
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {techStack.map((tech) => (
                    <div
                      key={tech.label}
                      className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 transition-colors hover:border-primary/40"
                    >
                      <span className="shrink-0">{tech.icon}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-rem-80 font-medium leading-none text-foreground">
                          {tech.label}
                        </span>
                        <span className="mt-0.5 block truncate text-rem-70 text-muted-foreground">{tech.desc}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </WindowCard>
        </div>
      </section>

      {/* ── Embed ──────────────────────────────────────────────────────────── */}
      <section id="embed" className="relative px-4 pb-16 md:px-6 md:pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHead
            index="05"
            kicker="Shipping it"
            title="One tag on the page you already have."
            subtitle="It renders a launcher, mounts the chat in an iframe, and talks back over postMessage. Nothing else touches your bundle."
            variant="left"
          />

          <div className="grid gap-4 lg:grid-cols-5">
            <WindowCard title="index.html" className="lg:col-span-3" variant="left">
              <Snippet label="index.html" code={EMBED_SNIPPET} />
              <p className="mt-4 text-rem-80 leading-relaxed text-muted-foreground">
                No bundler, no npm install, no React on the host page. The panel only loads its iframe the first
                time somebody opens it, so a visitor who never clicks pays nothing for it.
              </p>
            </WindowCard>

            <div className="lg:col-span-2">
              <BentoCard className="flex h-full min-h-[240px] items-end justify-end p-0" delayMs={120} variant="right">
                <HalftoneWash surface="card" fade="radial" />
                <div className="relative m-4 w-full max-w-[220px] overflow-hidden rounded-2xl border border-border bg-background shadow-xl sm:m-5">
                  <div className="border-b border-border px-3 py-2">
                    <span className="text-rem-75 font-semibold text-foreground">Ask Blayer</span>
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="max-w-[90%] rounded-xl bg-muted px-3 py-1.5 text-rem-75 text-foreground">
                      Hi! What can I help with?
                    </p>
                    <p className="ml-auto max-w-[90%] rounded-xl bg-primary px-3 py-1.5 text-rem-75 text-primary-foreground">
                      Do you ship to Bandung?
                    </p>
                  </div>
                </div>
              </BentoCard>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
