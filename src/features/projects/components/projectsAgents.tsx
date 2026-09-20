'use client'

import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useProjectsStates } from '../states/projectsStates'

export default function ProjectsAgents() {
  const { projectsDetail } = useProjectsStates()

  const project = projectsDetail.data

  if (!project) return null

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium tracking-tight">Agent</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Tiap agent punya versinya sendiri. Yang dipanggil API key project
            selalu versi yang sedang production.
          </p>
        </div>

        <Button asChild>
          <Link href={`/console/projects/${project.id}/agents/new`}>
            <Plus className="h-4 w-4" />
            Buat agent
          </Link>
        </Button>
      </div>

      <ul className="mt-5 flex flex-col gap-3">
        {project.agents.map((agent) => (
          <li key={agent.id}>
            <Link
              href={`/console/agents/${agent.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/30"
            >
              <span className="text-sm">
                {agent.name}
                <span className="text-muted-foreground"> · {agent.slug}</span>
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {agent.isPublished ? 'PRODUCTION' : 'DRAF'} ·{' '}
                {String(agent.totalRuns).padStart(2, '0')} RUN
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </li>
        ))}
        {!project.agents.length ? (
          <li className="text-sm text-muted-foreground">
            Belum ada agent di project ini.
          </li>
        ) : null}
      </ul>
    </section>
  )
}
