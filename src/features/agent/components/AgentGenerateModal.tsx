'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { postAgentGenerate } from '../services/agentServices'
import type { AgentPrefillData } from './AgentForm'

interface Props {
  open: boolean
  onClose: () => void
  onGenerated: (data: AgentPrefillData) => void
}

export default function AgentGenerateModal({ open, onClose, onGenerated }: Readonly<Props>) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setPrompt('')
      setError('')
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return
    setIsLoading(true)
    setError('')
    try {
      const result = await postAgentGenerate(prompt.trim())
      onGenerated(result)
      onClose()
    } catch {
      setError('Gagal generate agent. Coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleGenerate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-rem-80 font-semibold text-primary uppercase tracking-widest">AI Generate</span>
          </div>
          <DialogTitle className="leading-snug">
            Deskripsikan agent<br className="hidden sm:block" /> yang kamu inginkan
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 space-y-5">
          {/* Example chips */}
          <div className="flex flex-wrap gap-2">
            {['Asisten sepak bola', 'Chef masakan Indonesia', 'Tutor matematika'].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPrompt(ex)}
                className="rounded-full border border-border/80 px-3 py-1 text-rem-75 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="space-y-1.5">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder='Contoh: "buatkan agent chef yang spesialis masakan Jawa"'
              disabled={isLoading}
              className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 text-rem-95 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 transition-colors"
            />
            {error && <p className="text-rem-80 text-destructive">{error}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 pb-6 pt-1">
          <p className="text-rem-75 text-muted-foreground">Enter untuk generate</p>
          <Button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={!prompt.trim() || isLoading}
            className="group gap-2 rounded-xl"
          >
            {isLoading ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70 animate-bounce [animation-delay:300ms]" />
              </>
            ) : (
              <>
                Generate
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
