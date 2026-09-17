'use client'

import { Bot, ChevronDown, Star } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { useAgentControllers } from '../controllers/agentControllers'
import { useAgentStates } from '../states/agentStates'
import type { DataAgent } from '../types/agentTypes'

interface Props {
  selectedAgentId: string | null
  onSelectAgent: (agent: DataAgent | null) => void
}

export default function AgentSwitch({ selectedAgentId, onSelectAgent }: Readonly<Props>) {
  // variable importer
  useAgentControllers()

  // states / variable
  const { agentList } = useAgentStates()
  const agents = (agentList.data as DataAgent[]) ?? []
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-rem-80 font-medium text-foreground hover:bg-muted transition-colors"
        >
          {selectedAgent ? (
            <>
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                {selectedAgent.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedAgent.image} alt={selectedAgent.name} className="h-full w-full object-cover" />
                ) : (
                  <Bot className="h-3 w-3 text-primary" />
                )}
              </div>
              <span className="max-w-[100px] sm:max-w-[160px] truncate">{selectedAgent.name}</span>
              {selectedAgent.isDefault && <Star className="h-3 w-3 text-amber-500 shrink-0" />}
            </>
          ) : (
            <>
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Default (Knowledge Base)</span>
            </>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 max-h-60 overflow-y-auto">
        <DropdownMenuItem
          onClick={() => onSelectAgent(null)}
          className={`gap-2.5 py-2 ${!selectedAgentId ? 'bg-primary/10 text-primary' : ''}`}
        >
          <Bot className="h-4 w-4 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-rem-80 font-medium truncate">Default Agent</p>
            <p className="text-rem-70 text-muted-foreground">Prompt AI bawaan</p>
          </div>
        </DropdownMenuItem>

        {agents.length === 0 && (
          <p className="px-2 py-2 text-rem-75 text-muted-foreground">Belum ada agent</p>
        )}

        {agents.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onClick={() => onSelectAgent(agent)}
            className={`gap-2.5 py-2 ${selectedAgentId === agent.id ? 'bg-primary/10 text-primary' : ''}`}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
              {agent.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={agent.image} alt={agent.name} className="h-full w-full object-cover" />
              ) : (
                <Bot className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-rem-80 font-medium truncate">{agent.name}</p>
              {agent.personalization && (
                <p className="text-rem-70 text-muted-foreground truncate">{agent.personalization}</p>
              )}
            </div>
            {agent.isDefault && <Star className="h-3 w-3 text-amber-500 shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
