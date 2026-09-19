'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadData } from '@/shared/components/load-data'
import { useKnowledgeStates } from '../states/knowledgeStates'
import { useKnowledgeControllers } from '../controllers/knowledgeControllers'

interface Props {
  projectId: string
}

export default function KnowledgeList({ projectId }: Props) {
  const { knowledge } = useKnowledgeStates()
  const { storeKnowledge, removeKnowledge } = useKnowledgeControllers()
  const [form, setForm] = useState({ title: '', content: '' })

  const state = useMemo(
    () => ({
      data: knowledge.data,
      isLoading: knowledge.status === 'loading',
      isError: knowledge.status === 'error',
      isEmpty: knowledge.status === 'empty',
      emptyTitle: 'Belum ada dokumen',
      emptySubtitle:
        'Dokumen yang dipasang ke versi agent ikut dikirim sebagai rujukan, terpisah dari instruksinya.',
      errorTitle: 'Gagal memuat dokumen',
      errorSubtitle: knowledge.statusSubtitle,
    }),
    [knowledge]
  )

  const saveKnowledge = (event: React.FormEvent) => {
    event.preventDefault()

    storeKnowledge.mutate(
      {
        projectId,
        title: form.title.trim(),
        content: form.content.trim(),
      },
      { onSuccess: () => setForm({ title: '', content: '' }) }
    )
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="text-lg font-medium tracking-tight">Knowledge</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Pengetahuan disimpan terpisah dari prompt, lalu dipasang per versi
          agent. Isinya kamu yang menentukan, Blayer hanya menyediakan tempatnya.
        </p>

        <div className="mt-5">
          <LoadData response={state} minHeight="12vh">
            <ul className="flex flex-col gap-3">
              {knowledge.data.map((document) => (
                <li
                  key={document.id}
                  className="rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm">{document.title}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {document.totalChars.toLocaleString('id-ID')} karakter
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={removeKnowledge.isPending}
                        onClick={() => removeKnowledge.mutate({ id: document.id })}
                      >
                        Hapus
                      </Button>
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {document.preview}
                  </p>
                </li>
              ))}
            </ul>
          </LoadData>
        </div>
      </div>

      <form
        onSubmit={saveKnowledge}
        className="flex h-fit flex-col gap-4 rounded-xl border border-border bg-card p-6"
      >
        <h3 className="text-lg font-medium tracking-tight">Dokumen baru</h3>

        <div className="flex flex-col gap-2">
          <Label htmlFor="knowledge-title">Judul</Label>
          <Input
            id="knowledge-title"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder="Kebijakan penagihan"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="knowledge-content">Isi</Label>
          <Textarea
            id="knowledge-content"
            rows={10}
            value={form.content}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, content: event.target.value }))
            }
            placeholder="Tempel isi dokumennya di sini."
          />
        </div>

        {storeKnowledge.isError ? (
          <p className="text-sm leading-relaxed text-destructive">
            {storeKnowledge.error.message}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={
            storeKnowledge.isPending ||
            form.title.trim().length < 3 ||
            form.content.trim().length < 10
          }
        >
          {storeKnowledge.isPending ? 'Menyimpan…' : 'Simpan dokumen'}
        </Button>
      </form>
    </section>
  )
}
