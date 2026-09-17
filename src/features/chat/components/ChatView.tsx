'use client'

// Tracks the session ID that was just created via streaming — skip API reload for it
let justCreatedSessionId: string | null = null

import { useState, useEffect, useRef, useMemo } from 'react'
import { Plus, ArrowUp, Loader2 } from 'lucide-react'
import { useRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'
import { useSession } from 'next-auth/react'
import { Button } from '@/shared/components/ui/button'
import { useUIStates } from '@/shared/states/uiStates'
import { useAgentControllers } from '@/features/agent/controllers/agentControllers'
import { useAgentStates } from '@/features/agent/states/agentStates'
import AgentSwitch from '@/features/agent/components/AgentSwitch'
import type { DataAgent } from '@/features/agent/types/agentTypes'
import { useChatControllers } from '../controllers/chatControllers'
import { useChatStates } from '../states/chatStates'
import { getChatConversationsDetail, postChatConversationsRename } from '../services/chatServices'
import type { DataChatMessage } from '../types/chatTypes'

const defaultName = process.env.NEXT_PUBLIC_USER_NAME ?? 'Anda'

interface Props {
  readonly conversationId?: string
}

export default function ChatView({ conversationId }: Props) {
  // variable importer
  const router = useRouter()
  const { storeChat } = useChatControllers()
  const { chat, setChat } = useChatStates()
  useAgentControllers()
  const { agentList } = useAgentStates()
  const { selectedAgentId, setSelectedAgentId } = useUIStates()
  const { data: session } = useSession()

  // states / variable
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(!!conversationId && conversationId !== justCreatedSessionId)
  const [isInputBarVisible, setIsInputBarVisible] = useState(true)
  const sessionIdRef = useRef<string>(conversationId || crypto.randomUUID())
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastScrollTopRef = useRef(0)
  const messages = useMemo(() => chat.data ?? [], [chat.data])
  const isStreaming = chat.status === 'loading'
  const agents = (agentList.data as DataAgent[]) ?? []
  const defaultAgent = agents.find((a) => a.isDefault) ?? null
  const activeAgent = agents.find((a) => a.id === selectedAgentId) ?? defaultAgent
  const displayName = session?.user?.name?.split(' ')[0] ?? defaultName
  const isEmptyConversation = messages.length === 0

  // function / methode
  const appendChunk = (chunk: string) => {
    setChat((state) => ({
      data: state.data?.map((m, i) =>
        i === (state.data?.length ?? 0) - 1 ? { ...m, content: m.content + chunk } : m,
      ) ?? null,
    }))
  }

  const finalizeStream = () => {
    setChat((state) => ({
      status: 'success',
      statusTitle: 'Selesai',
      data: state.data?.map((m, i) =>
        i === (state.data?.length ?? 0) - 1 ? { ...m, streaming: false } : m,
      ) ?? null,
    }))
  }

  const readStream = async (body: ReadableStream<Uint8Array>) => {
    const reader = body.getReader()
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
  }

  const saveChatMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMsg: DataChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    const assistantMsg: DataChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: '', streaming: true }
    setChat({ status: 'loading', data: [...messages, userMsg, assistantMsg] })
    setInput('')

    try {
      const response = await storeChat.mutateAsync({
        message: text,
        sessionId: sessionIdRef.current,
        ...(session?.user?.id && { userId: session.user.id }),
        ...(activeAgent ? { agentId: activeAgent.id } : {}),
      })

      if (response?.body) await readStream(response.body)

      // Auto-save title on first message
      if (!conversationId && isEmptyConversation) {
        const title = text.slice(0, 50).replace(/[.!?].*/, '') || 'New Conversation'
        try {
          await postChatConversationsRename(sessionIdRef.current, title)
        } catch {
          // Silently fail
        }
      }

      if (!conversationId) {
        justCreatedSessionId = sessionIdRef.current
        await router.push(`/chat/${sessionIdRef.current}`)
      }
    } catch {
      setChat({
        status: 'error',
        statusTitle: 'Error',
        data: chat.data?.map((m, i) =>
          i === (chat.data?.length ?? 0) - 1 ? { ...m, content: 'Terjadi kesalahan. Coba lagi.', streaming: false } : m,
        ) ?? null,
      })
    } finally {
      finalizeStream()
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const loadConversationHistory = async () => {
    if (!conversationId) return

    try {
      const history = await getChatConversationsDetail(conversationId)
      const messages = history.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))
      setChat({ status: 'success', statusTitle: 'Loaded', data: messages })
    } catch (error) {
      console.error('Failed to load conversation:', error)
      setChat({ status: 'error', statusTitle: 'Failed to load conversation', data: [] })
    } finally {
      setIsLoading(false)
    }
  }

  const syncInput = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)

  const saveOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    void saveChatMessage(input)
  }

  const handleMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    const lastScrollTop = lastScrollTopRef.current
    if (scrollTop <= 0 || scrollTop < lastScrollTop) {
      setIsInputBarVisible(true)
    } else if (scrollTop > lastScrollTop) {
      setIsInputBarVisible(false)
    }
    lastScrollTopRef.current = scrollTop
  }

  // lifecycle react
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!conversationId) {
      // New chat — clear any previous conversation state
      setChat({ status: 'idle', statusTitle: '', data: null })
      sessionIdRef.current = crypto.randomUUID()
      return
    }

    // Skip API call — data already in state from the streaming session
    if (conversationId === justCreatedSessionId) {
      justCreatedSessionId = null
      setIsLoading(false)
      return
    }

    // Navigate to existing conversation — reset state and load from API
    setChat({ status: 'loading', statusTitle: 'Memuat...', data: [] })
    setIsLoading(true)
    void loadConversationHistory()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  // template
  const agentSwitch = agents.length > 0 && (
    <AgentSwitch
      selectedAgentId={selectedAgentId}
      onSelectAgent={(agent: DataAgent | null) => setSelectedAgentId(agent?.id ?? null)}
    />
  )

  const inputBar = (
    <div className="flex items-center gap-3 rounded-full border border-border bg-background px-4 py-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Tambah"
        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-5 w-5" />
      </Button>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={syncInput}
        onKeyDown={saveOnEnter}
        placeholder="Ask anything"
        disabled={isStreaming || isLoading}
        className="flex-1 appearance-none bg-transparent text-rem-90 text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
      />
      <Button
        type="button"
        size="icon"
        onClick={() => void saveChatMessage(input)}
        disabled={!input.trim() || isStreaming || isLoading}
        aria-label="Kirim pesan"
        className="h-7 w-7 shrink-0 rounded-full bg-foreground text-background hover:bg-foreground/80"
      >
        {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-card md:bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isEmptyConversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center overflow-hidden bg-card px-4 md:bg-background">
        <div className="relative isolate w-full max-w-xl overflow-hidden">
          <h1 className="mb-6 text-center text-2xl font-semibold text-foreground tracking-tight">
            Hello {displayName}, this is chaplin!
          </h1>

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[220px] w-[90vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 dark:hidden sm:h-[420px]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(251, 113, 133, 0.45) 0%, rgba(244, 63, 94, 0.22) 40%, transparent 70%)',
              filter: 'blur(52px)',
            }}
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden h-[220px] w-[90vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 dark:block sm:h-[420px]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(220, 38, 38, 0.30) 0%, rgba(185, 28, 28, 0.14) 45%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          {inputBar}
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-card md:bg-background">
      {agentSwitch && (
        <div className="hidden shrink-0 justify-end px-4 py-3 md:flex">
          {agentSwitch}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-28" onScroll={handleMessagesScroll}>
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-lg rounded-2xl px-4 py-2.5 text-rem-90 leading-relaxed ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <>
                    {msg.content && (
                      <div className="text-rem-90 leading-relaxed [&_p]:my-2 [&_p]:leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h4]:font-semibold [&_h4]:mt-2 [&_strong]:font-semibold [&_em]:italic [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_li]:leading-relaxed [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_blockquote]:opacity-75 [&_code:not(pre_>_code)]:font-mono [&_code:not(pre_>_code)]:text-[0.85em] [&_code:not(pre_>_code)]:bg-black/20 [&_code:not(pre_>_code)]:dark:bg-black/40 [&_code:not(pre_>_code)]:text-orange-400 [&_code:not(pre_>_code)]:px-1.5 [&_code:not(pre_>_code)]:py-0.5 [&_code:not(pre_>_code)]:rounded [&_pre]:bg-black/30 [&_pre]:dark:bg-black/60 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:font-mono [&_pre]:text-sm [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_hr]:border-border [&_hr]:my-3">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                    {msg.streaming && (
                      <div className={`flex items-center gap-1 ${msg.content ? 'mt-2' : 'py-0.5'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce [animation-delay:300ms]" />
                      </div>
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

      <div
        className={`absolute inset-x-0 bottom-0 bg-transparent px-4 py-4 transition-transform duration-300 ease-in-out ${
          isInputBarVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto max-w-2xl">{inputBar}</div>
      </div>
    </div>
  )
}
