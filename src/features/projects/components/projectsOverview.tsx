'use client'

import { useMemo } from 'react'
import Link from 'next/link'

import { useProjectsStates } from '../states/projectsStates'
import { PROJECTS_MENUS } from './projectsMenu'

export default function ProjectsOverview() {
  const { projectsDetail } = useProjectsStates()

  const project = projectsDetail.data

  const summary = useMemo(() => {
    if (!project) return []

    const totalRuns = project.agents.reduce((total, agent) => total + agent.totalRuns, 0)
    const published = project.agents.filter((agent) => agent.isPublished).length

    return [
      { label: 'Agent', value: project.agents.length, hint: `${published} sudah production` },
      { label: 'Eksekusi', value: totalRuns, hint: 'sepanjang umur project' },
      {
        label: 'API key',
        value: project.apiKeys.filter((apiKey) => !apiKey.isRevoked).length,
        hint: `${project.apiKeys.filter((apiKey) => apiKey.isRevoked).length} dicabut`,
      },
      {
        label: 'Kredensial',
        value: project.providerKeys.length,
        hint: 'kunci provider tersimpan',
      },
    ]
  }, [project])

  if (!project) return null

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card px-4 py-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {item.value.toLocaleString('id-ID')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-medium tracking-tight">Tentang project ini</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Slug</dt>
            <dd className="mt-1 text-sm">{project.slug}</dd>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Dibuat</dt>
            <dd className="mt-1 text-sm">
              {new Date(project.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3 sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Deskripsi</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {project.description || 'Tanpa deskripsi.'}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="text-lg font-medium tracking-tight">Lanjut ke</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {PROJECTS_MENUS.filter((menu) => menu.key !== 'ringkasan').map((menu) => (
            <li key={menu.key}>
              <Link
                href={{
                  pathname: `/console/projects/${project.id}`,
                  query: { menu: menu.key },
                }}
                shallow
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                <menu.icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">
                  {menu.label}
                  <span className="text-muted-foreground"> · {menu.hint}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
