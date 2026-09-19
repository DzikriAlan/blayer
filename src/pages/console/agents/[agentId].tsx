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
import { useProjectsStates } from '@/features/projects/states/projectsStates'
import { useIntegrationsControllers } from '@/features/integrations/controllers/integrationsControllers'
import { useKnowledgeControllers } from '@/features/knowledge/controllers/knowledgeControllers'

const AgentDetailPage: NextPage = () => {
  const router = useRouter()
  const agentId = typeof router.query.agentId === 'string' ? router.query.agentId : ''

  const { agentsDetail, setGetAgentsDetail } = useAgentsStates()
  const { setGetProjectsDetail } = useProjectsStates()

  useAgentsControllers()
  useIntegrationsControllers()
  useKnowledgeControllers()

  useEffect(() => {
    if (agentId) setGetAgentsDetail({ id: agentId })
  }, [agentId, setGetAgentsDetail])

  const agent = agentsDetail.data

  // Builder butuh daftar tool dan dokumen milik project agent ini; keduanya
  // diambil lewat project yang sedang dipilih.
  useEffect(() => {
    if (agent?.projectId) setGetProjectsDetail({ id: agent.projectId })
  }, [agent?.projectId, setGetProjectsDetail])

  return (
    <>
      <Head>
        <title>{agent ? `${agent.name} — BLAYER Console` : 'Agent — BLAYER Console'}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ConsoleShell
        backHref={agent ? `/console/projects/${agent.projectId}` : '/console'}
        backLabel="Project"
      >
        <ConsoleGate>
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-12 px-3 py-12 sm:px-5 sm:py-16">
            <div className="mesh-soft relative overflow-hidden rounded-2xl border border-border px-6 py-10 sm:px-10">
              <span aria-hidden className="noise pointer-events-none absolute inset-0 opacity-40" />
              <div className="relative">
                <span className="pixel-label text-primary">Agent</span>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                  {agent?.name ?? 'Agent'}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {agent ? `${agent.projectName} · ${agent.slug}` : 'Memuat…'}
                </p>
              </div>
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
