import type { PayloadPostAgent, PayloadPatchAgent, DataAgentGenerate } from '../types/agentTypes'
import { api } from '@/shared/lib/api'
import { formattingQueryString } from '@/shared/lib/utils'

export const getAgent = async () => {
  try {
    return await api('GET', '/agent')
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postAgent = async (payload: PayloadPostAgent) => {
  try {
    return await api('POST', '/agent', payload)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const patchAgent = async (id: string, payload: PayloadPatchAgent) => {
  try {
    const queryString = formattingQueryString({ id })
    return await api('PATCH', `/agent${queryString}`, payload)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const deleteAgent = async (id: string) => {
  try {
    const queryString = formattingQueryString({ id })
    return await api('DELETE', `/agent${queryString}`)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getAgentPublic = async (id: string) => {
  try {
    const queryString = formattingQueryString({ id })
    return await api('GET', `/agent/public${queryString}`)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postAgentGenerate = async (prompt: string): Promise<DataAgentGenerate> => {
  const result = await api('POST', '/agent/generate', { prompt })
  return result as DataAgentGenerate
}
