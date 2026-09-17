import { useAgentControllers } from '@/features/agent/controllers/agentControllers'
import { useAgentStates } from '@/features/agent/states/agentStates'
import { useUIStates } from '@/shared/states/uiStates'
import AgentSwitch from '@/features/agent/components/AgentSwitch'
import type { DataAgent } from '@/features/agent/types/agentTypes'

export default function ChatHeaderAgentSwitch() {
  useAgentControllers()
  const { agentList } = useAgentStates()
  const { selectedAgentId, setSelectedAgentId } = useUIStates()
  const agents = (agentList.data as DataAgent[]) ?? []

  if (agents.length === 0) return null

  return (
    <AgentSwitch
      selectedAgentId={selectedAgentId}
      onSelectAgent={(agent) => setSelectedAgentId(agent?.id ?? null)}
    />
  )
}
