'use client'

import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

      <Table className="mt-5">
        <TableHead>
          <TableRow>
            <TableHeader>Nama</TableHeader>
            <TableHeader>Slug</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Eksekusi</TableHeader>
            <TableHeader />
          </TableRow>
        </TableHead>
        <TableBody>
          {project.agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>
                <Link
                  href={`/console/agents/${agent.id}`}
                  className="transition-colors hover:text-primary"
                >
                  {agent.name}
                </Link>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {agent.slug}
              </TableCell>
              <TableCell className="text-xs">
                <span
                  className={
                    agent.isPublished
                      ? 'rounded border border-primary/40 px-2 py-0.5 text-primary'
                      : 'rounded border border-border px-2 py-0.5 text-muted-foreground'
                  }
                >
                  {agent.isPublished ? 'production' : 'draf'}
                </span>
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {agent.totalRuns.toLocaleString('id-ID')}
              </TableCell>
              <TableCell className="w-10 text-right">
                <Link
                  href={`/console/agents/${agent.id}`}
                  aria-label={`Buka ${agent.name}`}
                  className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </TableCell>
            </TableRow>
          ))}

          {!project.agents.length ? (
            <TableEmpty colSpan={5}>Belum ada agent di project ini.</TableEmpty>
          ) : null}
        </TableBody>
      </Table>
    </section>
  )
}
