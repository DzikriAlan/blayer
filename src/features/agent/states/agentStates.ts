import { create } from 'zustand'
import type { PayloadPostAgent, AgentList, AgentCreate } from '../types/agentTypes'

interface AgentStore {
  payloadPostAgent: PayloadPostAgent
  agentList: AgentList
  agentCreate: AgentCreate

  setPostAgent: (payload: Partial<PayloadPostAgent>) => void
  setAgentList: (payload: Partial<AgentList>) => void
  setAgentCreate: (payload: Partial<AgentCreate>) => void
}

export const useAgentStates = create<AgentStore>((set) => ({
  payloadPostAgent: {
    name: '',
    image: '',
    personalization: '',
    isDefault: false,
  },

  agentList: {
    status: 'loading',
    statusTitle: 'Memuat agents',
    statusSubtitle: 'Mohon tunggu...',
    data: null,
  },

  agentCreate: {
    status: 'loading',
    statusTitle: 'Menyimpan',
    statusSubtitle: 'Mohon tunggu...',
    data: null,
  },

  setPostAgent: (payload) =>
    set((state) => ({
      payloadPostAgent: { ...state.payloadPostAgent, ...payload },
    })),

  setAgentList: (payload) =>
    set((state) => ({
      agentList: { ...state.agentList, ...payload },
    })),

  setAgentCreate: (payload) =>
    set((state) => ({
      agentCreate: { ...state.agentCreate, ...payload },
    })),
}))
