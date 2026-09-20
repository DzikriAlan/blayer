'use client'

import { useMemo } from 'react'

import { LoadData } from '@/shared/components/load-data'
import { useProjectsStates } from '../states/projectsStates'
import ProjectsAgents from './projectsAgents'
import ProjectsCredentials from './projectsCredentials'
import ProjectsKeys from './projectsKeys'
import { PROJECTS_MENUS, type ProjectsMenuKey } from './projectsMenu'
import ProjectsOverview from './projectsOverview'

interface Props {
  menu: ProjectsMenuKey
  // Bagian yang datang dari feature lain (integration, knowledge) dipasang
  // halaman, supaya feature ini tidak ikut memikul isi feature tetangganya.
  children?: React.ReactNode
}

export default function ProjectsDetail({ menu, children }: Props) {
  const { projectsDetail } = useProjectsStates()

  const project = projectsDetail.data

  const state = useMemo(
    () => ({
      data: project,
      isLoading: projectsDetail.status === 'loading',
      isError: projectsDetail.status === 'error',
      isEmpty: projectsDetail.status === 'empty',
      emptyTitle: 'Project Tidak Ditemukan',
      emptySubtitle: 'Project ini mungkin sudah dihapus.',
      emptyImage: '/no-data.svg',
      errorTitle: 'Gagal Memuat Project',
      errorSubtitle: projectsDetail.statusSubtitle,
    }),
    [project, projectsDetail.status, projectsDetail.statusSubtitle]
  )

  const active = PROJECTS_MENUS.find((item) => item.key === menu) ?? PROJECTS_MENUS[0]

  return (
    <LoadData response={state} minHeight="60vh">
      {project ? (
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border px-5 py-4 sm:px-8">
            <div>
              <h1 className="text-base font-medium">{active.label}</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">{active.hint}</p>
            </div>

            <p className="text-xs text-muted-foreground">
              {project.agents.length} agent · {project.apiKeys.length} API key ·{' '}
              {project.providerKeys.length} kredensial
            </p>
          </div>

          <div className="px-5 py-8 sm:px-8">
            {active.key === 'ringkasan' ? <ProjectsOverview /> : null}
            {active.key === 'agent' ? <ProjectsAgents /> : null}
            {active.key === 'keys' ? <ProjectsKeys /> : null}
            {active.key === 'credentials' ? <ProjectsCredentials /> : null}
            {active.key === 'integrations' || active.key === 'knowledge'
              ? children
              : null}
          </div>
        </div>
      ) : null}
    </LoadData>
  )
}
