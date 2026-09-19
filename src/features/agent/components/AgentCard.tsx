import { Bot, Star, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/shared/components/ui/button'
import type { DataAgent } from '../types/agentTypes'

interface Props {
  agent: DataAgent
  onEdit: (agent: DataAgent) => void
  onPreview: (agent: DataAgent) => void
  onDelete: (id: string) => void
  /** Position in the grid, used to stagger the entrance. */
  index?: number
}

export default function AgentCard({ agent, onEdit, onPreview, onDelete, index = 0 }: Readonly<Props>) {
  return (
    <div
      className="animate-fade-up rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-md sm:p-5"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
          {agent.image ? <Image src={agent.image} alt={agent.name} fill sizes="40px" className="object-cover" /> : <Bot className="h-5 w-5 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-rem-100 font-semibold text-foreground truncate">{agent.name}</h3>
            {agent.isDefault && (
              <span className="flex items-center gap-0.5 text-rem-70 font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5 shrink-0">
                <Star className="h-2.5 w-2.5" />Default
              </span>
            )}
          </div>
          {agent.description && <p className="text-rem-85 text-muted-foreground mt-0.5 line-clamp-2">{agent.description}</p>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
        <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(agent)} className="text-muted-foreground hover:text-foreground">
          Ubah
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onPreview(agent)} className="text-muted-foreground hover:text-foreground">
          <span className="sm:hidden">Preview</span>
          <span className="hidden sm:inline">Preview Agent</span>
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(agent.id)} className="ml-auto shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
