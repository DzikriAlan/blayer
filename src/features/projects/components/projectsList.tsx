'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadData } from '@/shared/components/load-data'
import { useProjectsStates } from '../states/projectsStates'
import { useProjectsControllers } from '../controllers/projectsControllers'

const getSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)

export default function ProjectsList() {
  const { projects } = useProjectsStates()
  const { storeProjects } = useProjectsControllers()
  const [form, setForm] = useState({ name: '', slug: '', description: '' })

  const data = useMemo(
    () => ({
      data: projects.data,
      isLoading: projects.status === 'loading',
      isError: projects.status === 'error',
      isEmpty: projects.status === 'empty',
      emptyTitle: 'Belum Ada Project',
      emptySubtitle:
        'Project adalah wadah agent, API key, dan kredensial provider. Buat satu untuk mulai.',
      emptyImage: '/no-data.svg',
      errorTitle: 'Gagal Memuat Project',
      errorSubtitle: projects.statusSubtitle,
    }),
    [projects]
  )

  const editForm = (next: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...next }))

  const editName = (name: string) =>
    editForm({ name, slug: form.slug ? form.slug : getSlug(name) })

  const saveProjects = (event: React.FormEvent) => {
    event.preventDefault()

    storeProjects.mutate(
      {
        name: form.name.trim(),
        slug: (form.slug || getSlug(form.name)).trim(),
        description: form.description.trim(),
      },
      { onSuccess: () => setForm({ name: '', slug: '', description: '' }) }
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-display text-[clamp(1.9rem,4.5vw,3rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
        Project
        <span className="text-primary">.</span>
      </h1>
      <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
        Tiap project punya agent, API key, dan kredensial provider sendiri.
        Pemisahan itu yang menjaga satu project tidak memakai kunci project lain.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <LoadData response={data} minHeight="20vh">
            <ul className="grid gap-4 sm:grid-cols-2">
              {projects.data.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/console/projects/${project.id}`}
                    className="group flex h-full flex-col border-2 border-foreground bg-paper p-5 transition-shadow hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]"
                  >
                    <span className="brutal-eyebrow text-muted-foreground">
                      {project.slug}
                    </span>
                    <span className="mt-2 font-display text-lg font-black uppercase leading-tight tracking-tight">
                      {project.name}
                    </span>
                    <span className="mt-3 line-clamp-2 font-mono text-xs leading-relaxed text-muted-foreground">
                      {project.description || 'Tanpa deskripsi.'}
                    </span>
                    <span className="brutal-eyebrow mt-5 flex items-center gap-2 text-muted-foreground">
                      {String(project.totalAgents).padStart(2, '0')} AGENT ·{' '}
                      {String(project.totalApiKeys).padStart(2, '0')} KEY
                      <ArrowUpRight className="h-3.5 w-3.5 transition-colors group-hover:text-primary" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </LoadData>
        </div>

        <form
          onSubmit={saveProjects}
          className="flex h-fit flex-col gap-4 border-2 border-foreground bg-paper p-5"
        >
          <h2 className="font-display text-lg font-black uppercase leading-none tracking-tight">
            Project Baru
          </h2>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Nama</Label>
            <Input
              id="project-name"
              value={form.name}
              onChange={(event) => editName(event.target.value)}
              placeholder="EasyAccounting"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-slug">Slug</Label>
            <Input
              id="project-slug"
              value={form.slug}
              onChange={(event) => editForm({ slug: event.target.value })}
              placeholder="easyaccounting"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-description">Deskripsi</Label>
            <Textarea
              id="project-description"
              rows={3}
              value={form.description}
              onChange={(event) => editForm({ description: event.target.value })}
              placeholder="Apa yang dikerjakan project ini."
            />
          </div>

          {storeProjects.isError ? (
            <p className="font-mono text-xs leading-relaxed text-primary">
              {storeProjects.error.message}
            </p>
          ) : null}

          <Button type="submit" disabled={storeProjects.isPending || !form.name.trim()}>
            {storeProjects.isPending ? 'Menyimpan…' : 'Buat Project'}
          </Button>
        </form>
      </div>
    </div>
  )
}
