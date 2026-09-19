import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { ArrowUp, Loader2, X, RotateCcw, Bot } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface AgentPublicInfo {
  id: string
  name: string
  image: string | null
  description: string | null
}

export default function EmbedChatPage() {
  const router = useRouter()
  const agentId = router.isReady ? (router.query.agent as string | undefined) : undefined

  const [agentInfo, setAgentInfo] = useState<AgentPublicInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const sessionIdRef = useRef<string>(crypto.randomUUID())
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!agentId) return
    fetch(`/api/agent/public?id=${agentId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => { if (json?.data) setAgentInfo(json.data as AgentPublicInfo) })
      .catch(() => {})
  }, [agentId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const appendChunk = (chunk: string) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: m.content + chunk } : m))
    )
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '', streaming: true }
    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsStreaming(true)

    try {
      const res = await fetch('/api/embed/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionIdRef.current,
          ...(agentId ? { agentId } : {}),
        }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const json = JSON.parse(line.slice(6)) as { text?: string }
            if (json.text) appendChunk(json.text)
          } catch {}
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content: 'Terjadi kesalahan. Coba lagi.', streaming: false } : m
        )
      )
    } finally {
      setMessages((prev) =>
        prev.map((m, i) => (i === prev.length - 1 ? { ...m, streaming: false } : m))
      )
      setIsStreaming(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const closeWidget = useCallback(() => {
    window.parent.postMessage({ type: 'blayer:close' }, '*')
  }, [])

  const resetConversation = useCallback(() => {
    if (isStreaming) return
    sessionIdRef.current = crypto.randomUUID()
    setMessages([])
  }, [isStreaming])

  const agentName = agentInfo?.name ?? 'Blayer AI'

  return (
    <>
      <Head>
        <title>Blayer Chat</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="flex h-dvh flex-col bg-background font-sans text-foreground">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
            {agentInfo?.image ? (
              <Image src={agentInfo.image} alt={agentName} width={32} height={32} className="h-full w-full object-cover" />
            ) : (
              <Bot className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{agentName}</p>
            {agentInfo?.description && (
              <p className="text-xs text-muted-foreground truncate">{agentInfo.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={resetConversation}
            title="Mulai percakapan baru"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={closeWidget}
            title="Tutup"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Mulai percakapan dengan mengirim pesan</p>
            </div>
          )}
          <div className="max-w-full space-y-3" aria-live="polite" aria-busy={isStreaming}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex animate-message-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <>
                      {msg.content && (
                        <div className="text-sm leading-relaxed [&_p]:my-1.5 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_strong]:font-semibold [&_code:not(pre_>_code)]:bg-foreground/10 [&_code:not(pre_>_code)]:px-1 [&_code:not(pre_>_code)]:rounded [&_code:not(pre_>_code)]:text-iris [&_pre]:bg-foreground/[0.07] [&_pre]:dark:bg-black/50 [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:my-1.5 [&_pre]:overflow-x-auto [&_pre]:text-xs">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                      {msg.streaming && !msg.content && (
                        <div className="flex items-center gap-1 py-0.5" aria-label="Agent is typing">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-current"
                              style={{ animationDelay: `${i * 160}ms` }}
                            />
                          ))}
                        </div>
                      )}
                      {msg.streaming && msg.content && (
                        <span
                          aria-hidden="true"
                          className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse rounded-full bg-current align-baseline"
                        />
                      )}
                    </>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 transition-colors focus-within:border-primary/50">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); void sendMessage(input) }
              }}
              placeholder="Tulis pesan..."
              disabled={isStreaming}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:bg-primary/90 active:scale-90 disabled:opacity-30 disabled:active:scale-100"
            >
              {isStreaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUp className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-1.5">Powered by Blayer AI</p>
        </div>
      </div>
    </>
  )
}
