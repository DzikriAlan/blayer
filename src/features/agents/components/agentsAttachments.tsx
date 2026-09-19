'use client'

import { useIntegrationsStates } from '@/features/integrations/states/integrationsStates'
import { useKnowledgeStates } from '@/features/knowledge/states/knowledgeStates'
import { useIntegrationsControllers } from '@/features/integrations/controllers/integrationsControllers'

interface Props {
  toolIds: string[]
  documentIds: string[]
  onChange: (next: { toolIds?: string[]; documentIds?: string[] }) => void
}

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id]

// Tool dan dokumen menempel pada versi. Yang tampil di sini adalah milik project
// agent ini; mencentangnya berarti ikut terbawa saat draf disimpan.
export default function AgentsAttachments({
  toolIds,
  documentIds,
  onChange,
}: Props) {
  const { integrations } = useIntegrationsStates()
  const { knowledge } = useKnowledgeStates()
  useIntegrationsControllers()

  const tools = integrations.data.flatMap((integration) => integration.tools)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Tool</span>

        {integrations.data.length ? (
          <ul className="flex flex-col gap-2">
            {integrations.data.map((integration) => (
              <li
                key={integration.id}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="text-sm">{integration.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {integration.totalTools} tool terdaftar · buka halaman
                  integration untuk mengelolanya
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Project ini belum punya integration. Tambahkan di halaman project
            supaya agent bisa memanggil data milikmu.
          </p>
        )}

        {tools.length ? (
          <ul className="mt-1 flex flex-col gap-2">
            {tools.map((tool) => (
              <li key={tool.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-primary/40">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                    checked={toolIds.includes(tool.id)}
                    onChange={() => onChange({ toolIds: toggle(toolIds, tool.id) })}
                  />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm">{tool.name}</span>
                      {tool.permission === 'WRITE' ? (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/30">
                          WRITE
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {tool.description}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Knowledge</span>

        {knowledge.data.length ? (
          <ul className="flex flex-col gap-2">
            {knowledge.data.map((document) => (
              <li key={document.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-primary/40">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                    checked={documentIds.includes(document.id)}
                    onChange={() =>
                      onChange({ documentIds: toggle(documentIds, document.id) })
                    }
                  />
                  <span className="min-w-0">
                    <span className="block text-sm">{document.title}</span>
                    <span className="mt-1 block line-clamp-1 text-sm text-muted-foreground">
                      {document.preview}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Belum ada dokumen di project ini.
          </p>
        )}
      </div>
    </div>
  )
}
