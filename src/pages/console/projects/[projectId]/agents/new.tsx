import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import ConsoleShell from '@/components/console-shell'
import ConsoleGate from '@/features/console/components/consoleGate'
import AgentsCreate from '@/features/agents/components/agentsCreate'
import AgentsPreview from '@/features/agents/components/agentsPreview'
import { useAgentsControllers } from '@/features/agents/controllers/agentsControllers'
import { useIntegrationsControllers } from '@/features/integrations/controllers/integrationsControllers'
import { useKnowledgeControllers } from '@/features/knowledge/controllers/knowledgeControllers'
import { useProjectsStates } from '@/features/projects/states/projectsStates'
import { useProjectsControllers } from '@/features/projects/controllers/projectsControllers'
import type { AgentsConfigValue } from '@/features/agents/types/agentsTypes'

const DEFAULT_CONFIG: AgentsConfigValue = {
  provider: 'ANTHROPIC',
  model: 'claude-opus-5',
  effort: 'HIGH',
  maxTokens: 16000,
  temperature: null,
  instructions: '',
  toolIds: [],
  documentIds: [],
}

const AgentCreatePage: NextPage = () => {
  const router = useRouter()
  const projectId = typeof router.query.projectId === 'string' ? router.query.projectId : ''

  const { setGetProjectsDetail } = useProjectsStates()

  useProjectsControllers()
  useAgentsControllers()
  useIntegrationsControllers()
  useKnowledgeControllers()

  // Satu konfigurasi dipakai dua panel: kolom di kiri menyuntingnya, pratinjau
  // di kanan menjalankannya apa adanya.
  const [config, setConfig] = useState<AgentsConfigValue>(DEFAULT_CONFIG)

  const editConfig = (next: Partial<AgentsConfigValue>) =>
    setConfig((prev) => ({ ...prev, ...next }))

  useEffect(() => {
    if (projectId) setGetProjectsDetail({ id: projectId })
  }, [projectId, setGetProjectsDetail])

  return (
    <>
      <Head>
        <title>Agent baru — BLAYER Console</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ConsoleShell
        backHref={projectId ? `/console/projects/${projectId}?menu=agent` : '/console'}
        backLabel="Project"
      >
        <ConsoleGate>
          <div className="mx-auto w-full max-w-[110rem] px-5 py-10 sm:px-8">
            <div className="border-b border-border pb-6">
              <span className="pixel-label text-primary">Agent baru</span>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                Susun sambil dicoba
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Kolom di kiri menentukan perilaku agent. Panel di kanan
                menjalankannya memakai kunci provider project ini — tanpa
                menyimpan agent, versi, maupun jejak eksekusi.
              </p>
            </div>

            {projectId ? (
              <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
                <AgentsCreate
                  projectId={projectId}
                  config={config}
                  onChange={editConfig}
                />

                <div className="lg:sticky lg:top-24">
                  <AgentsPreview projectId={projectId} config={config} />
                </div>
              </div>
            ) : null}
          </div>
        </ConsoleGate>
      </ConsoleShell>
    </>
  )
}

export default AgentCreatePage
