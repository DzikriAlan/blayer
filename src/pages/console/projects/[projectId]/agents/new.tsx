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
        breadcrumb={[
          {
            label: 'Project',
            href: projectId ? `/console/projects/${projectId}?menu=agent` : '/console',
          },
          { label: 'Agent baru' },
        ]}
      >
        <ConsoleGate>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border px-5 py-4 sm:px-8">
              <div>
                <h1 className="text-base font-medium">Agent baru</h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Kolom di kiri menentukan perilakunya; panel di kanan
                  menjalankannya tanpa menyimpan apa pun
                </p>
              </div>
            </div>

            <div className="px-5 py-8 sm:px-8">
            {projectId ? (
              <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
                <AgentsCreate
                  projectId={projectId}
                  config={config}
                  onChange={editConfig}
                />

                <div className="lg:sticky lg:top-20">
                  <AgentsPreview projectId={projectId} config={config} />
                </div>
              </div>
            ) : null}
            </div>
          </div>
        </ConsoleGate>
      </ConsoleShell>
    </>
  )
}

export default AgentCreatePage
