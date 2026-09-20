'use client'

import { useMemo } from 'react'

import { LoadData } from '@/shared/components/load-data'
import { useProjectsStates } from '../states/projectsStates'
import ProjectsAgents from './projectsAgents'
import ProjectsCredentials from './projectsCredentials'
import ProjectsKeys from './projectsKeys'
import ProjectsMenu, { PROJECTS_MENUS, type ProjectsMenuKey } from './projectsMenu'
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
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
      <LoadData response={state} minHeight="40vh">
        {project ? (
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="pixel-label text-primary">Project</span>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                  {project.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{project.slug}</p>
              </div>

              <p className="text-xs text-muted-foreground">
                {project.agents.length} agent · {project.apiKeys.length} API key
              </p>
            </div>

            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[13rem_1fr] lg:gap-10">
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <ProjectsMenu projectId={project.id} active={active.key} />
              </aside>

              <div className="min-w-0">
                <div className="mb-6 lg:hidden">
                  <h2 className="text-sm font-medium">{active.label}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{active.hint}</p>
                </div>

                {active.key === 'ringkasan' ? <ProjectsOverview /> : null}
                {active.key === 'agent' ? <ProjectsAgents /> : null}
                {active.key === 'keys' ? <ProjectsKeys /> : null}
                {active.key === 'credentials' ? <ProjectsCredentials /> : null}
                {active.key === 'integrations' || active.key === 'knowledge'
                  ? children
                  : null}
              </div>
            </div>
          </div>
        ) : null}
      </LoadData>
    </div>
  )
}
