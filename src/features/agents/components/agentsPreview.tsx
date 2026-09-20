'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, SendHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SELECT_CLASS } from './agentsConfigFields'
import { useAgentsControllers } from '../controllers/agentsControllers'
import type {
  AgentsConfigValue,
  AgentsEnvironment,
  AgentsPreviewMessage,
} from '../types/agentsTypes'

const ENVIRONMENTS: AgentsEnvironment[] = [
  'DEVELOPMENT',
  'STAGING',
  'PRODUCTION',
]

interface Props {
  projectId: string
  config: AgentsConfigValue
}

export default function AgentsPreview({ projectId, config }: Props) {
  const { storeAgentsPreview } = useAgentsControllers()

  const [environment, setEnvironment] = useState<AgentsEnvironment>('DEVELOPMENT')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<AgentsPreviewMessage[]>([])
  // Tanda konfigurasi yang dipakai jawaban terakhir. Dibandingkan dengan yang
  // sekarang supaya terlihat kapan jawaban di layar sudah ketinggalan.
  const [answeredWith, setAnsweredWith] = useState('')

  const threadRef = useRef<HTMLDivElement>(null)

  const signature = useMemo(() => JSON.stringify(config), [config])
  const isStale = !!messages.length && !!answeredWith && answeredWith !== signature

  const result = storeAgentsPreview.data ?? null

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length, storeAgentsPreview.isPending])

  const sendPreview = (event: React.FormEvent) => {
    event.preventDefault()

    const content = input.trim()
    if (!content || storeAgentsPreview.isPending) return

    const thread: AgentsPreviewMessage[] = [...messages, { role: 'user', content }]

    setMessages(thread)
    setInput('')

    storeAgentsPreview.mutate(
      { projectId, environment, ...config, messages: thread },
      {
        onSuccess: (data) => {
          setAnsweredWith(signature)
          setMessages([
            ...thread,
            {
              role: 'assistant',
              content: data.output || '(jawaban kosong)',
            },
          ])
        },
      }
    )
  }

  const clearPreview = () => {
    setMessages([])
    setAnsweredWith('')
    storeAgentsPreview.reset()
  }

  return (
    <div className="flex h-full min-h-[32rem] flex-col rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <span className="pixel-label text-primary">Pratinjau</span>

        <span className="text-xs text-muted-foreground">
          {config.model} · {config.effort}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <select
            aria-label="Environment kunci provider"
            className={SELECT_CLASS}
            value={environment}
            onChange={(event) =>
              setEnvironment(event.target.value as AgentsEnvironment)
            }
          >
            {ENVIRONMENTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearPreview}
            disabled={!messages.length}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Ulang
          </Button>
        </div>
      </div>

      <div ref={threadRef} className="flex-1 overflow-y-auto px-5 py-5">
        {!messages.length ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              Coba agentnya di sini sebelum disimpan.
            </p>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Tiap kiriman memakai isi kolom di sebelah kiri apa adanya —
              instruksi, model, tool, dan dokumen yang sedang kamu susun.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === 'user'
                  ? 'ml-auto max-w-[85%] rounded-lg bg-primary/15 px-4 py-3'
                  : 'mr-auto max-w-[95%] rounded-lg border border-border bg-background px-4 py-3'
              }
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>
            </div>
          ))}

          {storeAgentsPreview.isPending ? (
            <p className="mr-auto text-sm text-muted-foreground">Menjawab…</p>
          ) : null}

          {storeAgentsPreview.isError ? (
            <p className="mr-auto max-w-[95%] rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-destructive">
              {storeAgentsPreview.error.message}
            </p>
          ) : null}

          {result?.toolCalls.length ? (
            <ul className="mr-auto flex max-w-[95%] flex-col gap-2">
              {result.toolCalls.map((call, index) => (
                <li
                  key={`${call.name}-${index}`}
                  className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs"
                >
                  <span className="text-foreground">{call.name}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    · {call.permission} · {call.status}
                  </span>
                  {call.output ? (
                    <p className="mt-1 line-clamp-3 text-muted-foreground">
                      {call.output}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {result && !storeAgentsPreview.isPending ? (
        <p className="border-t border-border px-5 py-2 text-xs text-muted-foreground">
          {result.latencyMs} ms · {result.inputTokens} token masuk ·{' '}
          {result.outputTokens} token keluar
          {result.costUsd === null
            ? ''
            : ` · $${result.costUsd.toFixed(4)}`}
        </p>
      ) : null}

      {isStale ? (
        <p className="border-t border-border bg-primary/5 px-5 py-2 text-xs text-primary">
          Konfigurasinya berubah. Kirim lagi untuk melihat hasil yang baru.
        </p>
      ) : null}

      <form onSubmit={sendPreview} className="flex flex-col gap-3 border-t border-border p-4">
        <Textarea
          aria-label="Masukan pratinjau"
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              sendPreview(event)
            }
          }}
          placeholder="Tanya apa saja ke agent ini…"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            ⌘/Ctrl + Enter untuk kirim
          </span>

          <Button type="submit" disabled={!input.trim() || storeAgentsPreview.isPending}>
            <SendHorizontal className="h-4 w-4" />
            {storeAgentsPreview.isPending ? 'Menjawab…' : 'Kirim'}
          </Button>
        </div>
      </form>
    </div>
  )
}
