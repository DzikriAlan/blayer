import { useState } from 'react'
import { CornerDownRight } from 'lucide-react'
import { SectionHead } from './LandingSection'
import { Reveal } from './LandingDecor'
import WindowCard from './LandingWindow'

/* The section that shows the product's actual mechanic: one paragraph of plain
   English becomes a colleague who answers. Switching the role switches BOTH the
   paragraph and the conversations under it, so the cause and the effect are
   visibly the same control — that is the point, and it is why this is not a
   grid of feature cards. */

interface Role {
  key: string
  label: string
  file: string
  prompt: string
  replies: { question: string; answer: string; seconds: string }[]
}

const ROLES: Role[] = [
  {
    key: 'support',
    label: 'Support',
    file: 'northwind-support.txt',
    prompt:
      'You are the support agent for Northwind. Answer from the help centre only. Keep replies under four sentences. The moment money is involved — refunds, chargebacks, a disputed invoice — stop and hand off to a human.',
    replies: [
      { question: 'My invoice says 14 seats but we only have 9 people.', answer: 'That gap is usually deactivated members still holding a seat. Billing → Seats shows who. I am handing this to a human — it touches an invoice.', seconds: '0.9s' },
      { question: 'How do I reset a subscription cycle?', answer: 'Billing → Subscriptions → pick the customer → Reset cycle. It takes effect on the next invoice date, not immediately.', seconds: '0.6s' },
      { question: 'is there an api', answer: 'Yes — REST, token auth, docs at /developers. Rate limit is 600 requests a minute per token.', seconds: '0.4s' },
    ],
  },
  {
    key: 'sales',
    label: 'Pre-sales',
    file: 'inbound-qualify.txt',
    prompt:
      'You are a pre-sales engineer. Find out what the visitor already runs before you describe anything. Map their stack to our integrations by name. Never quote a price — book a call instead.',
    replies: [
      { question: 'Do you work with Postgres or do we need to migrate?', answer: 'Postgres is what it expects — Supabase, Neon, RDS, or your own. No migration. What are you running now?', seconds: '0.7s' },
      { question: 'whats the pricing for 50 seats', answer: 'Seat pricing depends on the plan shape, so I will not guess at it. Fifteen minutes with our team gets you a real number — want me to book it?', seconds: '0.5s' },
    ],
  },
  {
    key: 'internal',
    label: 'Internal',
    file: 'onboarding-buddy.txt',
    prompt:
      'You are the onboarding buddy for new engineers. Cite the runbook you pulled each answer from. When something is not documented yet, say so plainly instead of inventing a procedure.',
    replies: [
      { question: 'How do I get staging database access?', answer: 'Open an access request in #infra-requests with your GitHub handle. Runbook: infra/access.md, section 3.', seconds: '0.5s' },
      { question: 'Who approves a schema migration?', answer: 'Not documented yet. The last three went through Rani, but I would confirm rather than take that as policy.', seconds: '0.8s' },
      { question: 'where do env vars live', answer: 'Vercel project settings per environment; .env.example is the canonical list. Runbook: infra/config.md.', seconds: '0.4s' },
    ],
  },
]

export default function LandingShowcase() {
  const [activeKey, setActiveKey] = useState(ROLES[0].key)
  const active = ROLES.find((r) => r.key === activeKey) ?? ROLES[0]

  return (
    <section id="agents" className="relative px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHead
          index="01"
          kicker="How it works"
          title="One paragraph in. Thousands of answers out."
          subtitle="An agent is not a flowchart or a decision tree. It is a paragraph you could have written in an email. Change the paragraph, change the job."
          variant="left"
        />

        {/* Role switch — drives both panels below, so it reads as one control */}
        <Reveal variant="fade" delayMs={120} className="mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 hidden text-rem-70 text-muted-foreground sm:inline">Hire it as</span>
            {ROLES.map((role) => (
              <button
                key={role.key}
                type="button"
                aria-pressed={role.key === activeKey}
                onClick={() => setActiveKey(role.key)}
                className={`rounded-full border px-4 py-1.5 text-rem-85 font-medium transition-colors ${
                  role.key === activeKey
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Deliberately asymmetric: the input is narrow, the output is wide.
            That ratio IS the claim the section is making. */}
        <div className="grid items-start gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <WindowCard title={active.file} padded={false} delayMs={0}>
              <p className="p-4 font-mono text-rem-80 leading-relaxed text-foreground sm:p-5 sm:text-rem-85">
                {active.prompt}
              </p>
              <p className="border-t border-border px-4 py-2.5 text-rem-65 text-muted-foreground sm:px-5">
                {active.prompt.trim().split(/\s+/).length} words. That is the whole configuration.
              </p>
            </WindowCard>
          </div>

          <div className="lg:col-span-7">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <CornerDownRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-rem-75">becomes, on your site, at 3am</span>
            </div>

            {/* Varying widths and offsets — a fan, not a grid. Uniform cards
                here would flatten the "many answers" idea into a feature list. */}
            <ul className="space-y-3">
              {active.replies.map((reply, i) => (
                <li
                  key={reply.question}
                  className="animate-slide-in-right rounded-2xl border border-border bg-card p-4"
                  style={{
                    animationDelay: `${i * 90}ms`,
                    marginLeft: `${i * 4}%`,
                    marginRight: `${Math.max(0, 10 - i * 5)}%`,
                  }}
                >
                  <p className="text-rem-80 text-muted-foreground">
                    <span className="sr-only">Visitor asked: </span>
                    &ldquo;{reply.question}&rdquo;
                  </p>
                  <p className="mt-2 text-rem-85 leading-relaxed text-foreground">{reply.answer}</p>
                  <p className="mt-2.5 flex items-center gap-2 text-rem-65 text-muted-foreground">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-series-2" aria-hidden="true" />
                    answered in {reply.seconds}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-rem-65 leading-relaxed text-muted-foreground">
              Exchanges written for this page to show tone and hand-off behaviour, not transcripts from a live
              deployment. Response times reflect local streaming latency on the demo agent.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
