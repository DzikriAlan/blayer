import {
  AGENT_MODELS,
  DEFAULT_AGENT_MODEL,
  type AgentModelItem,
} from '@/server/shared/utils/catalog.util'

export interface ModelsResponseDto {
  defaultModel: string
  models: AgentModelItem[]
}

export class ModelsService {
  fetchModels(): ModelsResponseDto {
    return { defaultModel: DEFAULT_AGENT_MODEL, models: AGENT_MODELS }
  }
}

export const modelsService = new ModelsService()
