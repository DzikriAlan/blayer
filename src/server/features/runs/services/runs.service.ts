import {
  agentRuntimeService,
  type AgentRuntimeService,
} from '@/server/shared/services/agentRuntime.service'
import type { CreateRunsConfirmDto } from '../dto/runs.dto'

export class RunsService {
  constructor(private readonly agentRuntimeService: AgentRuntimeService) {}

  // Konfirmasi selalu datang dari pemanggil, tidak pernah diputuskan sendiri
  // oleh model — itu inti guardrail tool tulis.
  async storeRunsConfirm(
    runId: string,
    dto: CreateRunsConfirmDto,
    scopedProjectId: string | null
  ) {
    return this.agentRuntimeService.storeRunsConfirm({
      runId,
      toolCallId: dto.toolCallId,
      isConfirmed: dto.decision === 'CONFIRM',
      scopedProjectId,
    })
  }
}

export const runsService = new RunsService(agentRuntimeService)
