import { useEffect } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import ConsoleShell from '@/components/console-shell'
import ConsoleGate from '@/features/console/components/consoleGate'
import ProjectsDetail from '@/features/projects/components/projectsDetail'
import AgentsCreate from '@/features/agents/components/agentsCreate'
import { useProjectsStates } from '@/features/projects/states/projectsStates'
import { useProjectsControllers } from '@/features/projects/controllers/projectsControllers'
import { useAgentsControllers } from '@/features/agents/controllers/agentsControllers'

const ProjectDetailPage: NextPage = () => {
  const router = useRouter()
  const projectId = typeof router.query.projectId === 'string' ? router.query.projectId : ''

  const { setGetProjectsDetail } = useProjectsStates()

  useProjectsControllers()
  useAgentsControllers()

  useEffect(() => {
    if (projectId) setGetProjectsDetail({ id: projectId })
  }, [projectId, setGetProjectsDetail])

  return (
    <>
      <Head>
        <title>Project — BLAYER Console</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ConsoleShell backHref="/console" backLabel="SEMUA PROJECT">
        <ConsoleGate>
          <ProjectsDetail>
            {projectId ? <AgentsCreate projectId={projectId} /> : null}
          </ProjectsDetail>
        </ConsoleGate>
      </ConsoleShell>
    </>
  )
}

export default ProjectDetailPage
