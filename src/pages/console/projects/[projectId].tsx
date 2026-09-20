import { useEffect } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import ConsoleShell from '@/components/console-shell'
import ConsoleGate from '@/features/console/components/consoleGate'
import ProjectsDetail from '@/features/projects/components/projectsDetail'
import { getProjectsMenu } from '@/features/projects/components/projectsMenu'
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
  const menu = getProjectsMenu(router.query.menu)

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
          <ProjectsDetail menu={menu}>
            {projectId && menu === 'integrations' ? (
              <IntegrationsList projectId={projectId} />
            ) : null}
            {projectId && menu === 'knowledge' ? (
              <KnowledgeList projectId={projectId} />
            ) : null}
          </ProjectsDetail>
        </ConsoleGate>
      </ConsoleShell>
    </>
  )
}

export default ProjectDetailPage
