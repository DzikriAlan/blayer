'use client'

import { useState, useEffect, useRef } from 'react'
import { Bot, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/shared/components/ui/button'
import { apiFetch } from '@/shared/lib/api'
import type { DataAgent } from '../types/agentTypes'

interface PreviewMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  agent: DataAgent
}

export default function AgentPreviewInline({ agent }: Readonly<Props>) {
  // states / variable
  const [messages, setMessages] = useState<PreviewMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isDisabled = isStreaming || !input.trim()

  // function / methode
  const getPreviewStream = async (response: Response, assistantId: string) => {
    if (!response.body) throw new Error('No response body')
    const reader = response.body.getReader()
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
        try { const data = JSON.parse(line.slice(6)); if (data.text) { setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + data.text } : m))) } } catch { /* ignore */ }
      }
    }
  }

  const saveChatMessage = async () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    setMessages((prev) => [...prev, { id: 'u_' + Date.now(), role: 'user', content: text }])
    const assistantId = 'a_' + Date.now()
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])
    setIsStreaming(true)
    try {
      const response = await apiFetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: 'preview_' + agent.id + '_' + Date.now(),
          agentId: agent.id,
          isPreview: true,
          ...(agent.personalization && { personalization: agent.personalization }),
        }),
      })
      if (!response.ok || !response.body) throw new Error('Request failed')
      await getPreviewStream(response, assistantId)
    } catch { setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content || 'Gagal memuat respons.' } : m))) }
    finally { setIsStreaming(false) }
  }

  const getKeyDownHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveChatMessage() } }

  // lifecycle react
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {agent.image ? <img src={agent.image} alt={agent.name} className="h-full w-full object-cover" /> : <Bot className="h-8 w-8 text-primary" />}
              </div>
            </div>
            <h2 className="text-rem-140 font-bold text-foreground tracking-tight text-center">{agent.name}</h2>
            {agent.description && <p className="text-rem-90 text-muted-foreground mt-2 text-center max-w-sm">{agent.description}</p>}
          </div>
        ) : (
          <div className="space-y-8 py-2">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'
              const isLast = msg.id === messages.at(-1)?.id
              if (isUser) {
                return <div key={msg.id} className="flex animate-message-in justify-end"><div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-muted px-4 py-2.5 text-rem-90 text-foreground">{msg.content}</div></div>
              }
              return (
                <div key={msg.id} className="flex animate-message-in gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden mt-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {agent.image ? <img src={agent.image} alt={agent.name} className="h-full w-full object-cover" /> : <Bot className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-rem-90 text-foreground leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5 [&_strong]:font-semibold [&_em]:italic [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-rem-85">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                      {isLast && isStreaming && <span className="inline-block w-0.5 h-4 bg-foreground/60 animate-pulse ml-0.5" />}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="pt-4 shrink-0">
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center gap-3 px-4 py-3">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={getKeyDownHandler} placeholder="Ketik pesan untuk test agent..." rows={1} className="flex-1 resize-none bg-transparent text-rem-90 text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed max-h-32 overflow-y-auto" />
            <Button type="button" size="icon" onClick={saveChatMessage} disabled={isDisabled} className="h-8 w-8 shrink-0 rounded-full">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
