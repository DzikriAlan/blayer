import { useEffect } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import ConsoleShell from '@/components/console-shell'
import ConsoleGate from '@/features/console/components/consoleGate'
import AgentsBuilder from '@/features/agents/components/agentsBuilder'
import AgentsPlayground from '@/features/agents/components/agentsPlayground'
import AgentsRuns from '@/features/agents/components/agentsRuns'
import { useAgentsStates } from '@/features/agents/states/agentsStates'
import { useAgentsControllers } from '@/features/agents/controllers/agentsControllers'

const AgentDetailPage: NextPage = () => {
  const router = useRouter()
  const agentId = typeof router.query.agentId === 'string' ? router.query.agentId : ''

  const { agentsDetail, setGetAgentsDetail } = useAgentsStates()

  useAgentsControllers()

  useEffect(() => {
    if (agentId) setGetAgentsDetail({ id: agentId })
  }, [agentId, setGetAgentsDetail])

  const agent = agentsDetail.data

  return (
    <>
      <Head>
        <title>{agent ? `${agent.name} — BLAYER Console` : 'Agent — BLAYER Console'}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ConsoleShell
        backHref={agent ? `/console/projects/${agent.projectId}` : '/console'}
        backLabel="PROJECT"
      >
        <ConsoleGate>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-12 sm:px-8 sm:py-16">
            <div>
              <span className="brutal-eyebrow text-muted-foreground">
                {agent ? `${agent.projectName} · ${agent.slug}` : 'MEMUAT'}
              </span>
              <h1 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
                {agent?.name ?? 'Agent'}
                <span className="text-primary">.</span>
              </h1>
            </div>

            <AgentsBuilder />
            <AgentsPlayground />
            <AgentsRuns />
          </div>
        </ConsoleGate>
      </ConsoleShell>
    </>
  )
}

export default AgentDetailPage
