import { useEffect } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import ConsoleShell from '@/components/console-shell'
import ConsoleGate from '@/features/console/components/consoleGate'
import ProjectsDetail from '@/features/projects/components/projectsDetail'
import AgentsCreate from '@/features/agents/components/agentsCreate'
import IntegrationsList from '@/features/integrations/components/integrationsList'
import KnowledgeList from '@/features/knowledge/components/knowledgeList'
import { useIntegrationsControllers } from '@/features/integrations/controllers/integrationsControllers'
import { useKnowledgeControllers } from '@/features/knowledge/controllers/knowledgeControllers'
import { useProjectsStates } from '@/features/projects/states/projectsStates'
import { useProjectsControllers } from '@/features/projects/controllers/projectsControllers'
import { useAgentsControllers } from '@/features/agents/controllers/agentsControllers'

const ProjectDetailPage: NextPage = () => {
  const router = useRouter()
  const projectId = typeof router.query.projectId === 'string' ? router.query.projectId : ''

  const { setGetProjectsDetail } = useProjectsStates()

  useProjectsControllers()
  useAgentsControllers()
  useIntegrationsControllers()
  useKnowledgeControllers()

  useEffect(() => {
    if (projectId) setGetProjectsDetail({ id: projectId })
  }, [projectId, setGetProjectsDetail])

  return (
    <>
      <Head>
        <title>Project — BLAYER Console</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ConsoleShell backHref="/console" backLabel="Semua project">
        <ConsoleGate>
          <ProjectsDetail>
            {projectId ? <AgentsCreate projectId={projectId} /> : null}
          </ProjectsDetail>

          {projectId ? (
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-12 px-3 pb-16 sm:px-5">
              <IntegrationsList projectId={projectId} />
              <KnowledgeList projectId={projectId} />
            </div>
          ) : null}
        </ConsoleGate>
      </ConsoleShell>
    </>
  )
}

export default ProjectDetailPage
