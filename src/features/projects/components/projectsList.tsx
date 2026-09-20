'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  // Slug ikut nama selama belum pernah disunting sendiri. Tanpa penanda ini,
  // slug terkunci pada huruf pertama yang diketik dan berakhir terlalu pendek.
  const [isSlugEdited, setSlugEdited] = useState(false)

  const data = useMemo(
    () => ({
      data: projects.data,
      isLoading: projects.status === 'loading',
      isError: projects.status === 'error',
      isEmpty: projects.status === 'empty',
      emptyTitle: 'Belum ada project',
      emptySubtitle:
        'Project adalah wadah agent, API key, dan kredensial provider. Buat satu untuk mulai.',
      errorTitle: 'Gagal memuat project',
      errorSubtitle: projects.statusSubtitle,
    }),
    [projects]
  )

  const editForm = (next: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...next }))

  const editName = (name: string) =>
    editForm({ name, ...(isSlugEdited ? {} : { slug: getSlug(name) }) })

  const editSlug = (slug: string) => {
    setSlugEdited(true)
    editForm({ slug })
  }

  const saveProjects = (event: React.FormEvent) => {
    event.preventDefault()

    storeProjects.mutate(
      {
        name: form.name.trim(),
        slug: (form.slug || getSlug(form.name)).trim(),
        description: form.description.trim(),
      },
      {
        onSuccess: () => {
          setForm({ name: '', slug: '', description: '' })
          setSlugEdited(false)
        },
      }
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border px-5 py-4 sm:px-8">
        <div>
          <h1 className="text-base font-medium">Project</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Wadah agent, API key, dan kredensial provider
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          {projects.data.length} project
        </p>
      </div>

      <div className="grid gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
        <LoadData response={data} minHeight="20vh">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Nama</TableHeader>
                <TableHeader>Slug</TableHeader>
                <TableHeader className="text-right">Agent</TableHeader>
                <TableHeader className="text-right">API key</TableHeader>
                <TableHeader />
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.data.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link
                      href={`/console/projects/${project.id}`}
                      className="transition-colors hover:text-primary"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {project.slug}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {project.totalAgents}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {project.totalApiKeys}
                  </TableCell>
                  <TableCell className="w-10 text-right">
                    <Link
                      href={`/console/projects/${project.id}`}
                      aria-label={`Buka ${project.name}`}
                      className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}

              {!projects.data.length ? (
                <TableEmpty colSpan={5}>
                  Belum ada project. Buat satu untuk mulai.
                </TableEmpty>
              ) : null}
            </TableBody>
          </Table>
        </LoadData>

        <form
          onSubmit={saveProjects}
          className="flex h-fit flex-col gap-4 rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-lg font-medium tracking-tight">Project baru</h2>

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
              onChange={(event) => editSlug(event.target.value)}
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
            <p className="text-sm leading-relaxed text-destructive">
              {storeProjects.error.message}
            </p>
          ) : null}

          <Button type="submit" disabled={storeProjects.isPending || !form.name.trim()}>
            {storeProjects.isPending ? 'Menyimpan…' : 'Buat project'}
          </Button>
        </form>
      </div>
    </div>
  )
}
