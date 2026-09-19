import { create } from 'zustand'

import type {
  AgentsDetail,
  AgentsRuns,
  DataAgentsDetail,
  DataAgentsRunHistory,
  DataAgentsRunResult,
  PayloadGetAgentsDetail,
} from '../types/agentsTypes'

interface AgentsStore {
  payloadGetAgentsDetail: PayloadGetAgentsDetail
  agentsDetail: AgentsDetail
  agentsRuns: AgentsRuns
  playgroundResult: DataAgentsRunResult | null
  setGetAgentsDetail: (payload: Partial<PayloadGetAgentsDetail>) => void
  setAgentsDetail: (agentsDetail: Partial<AgentsDetail>) => void
  setAgentsRuns: (agentsRuns: Partial<AgentsRuns>) => void
  setPlaygroundResult: (playgroundResult: DataAgentsRunResult | null) => void
}

export const useAgentsStates = create<AgentsStore>((set) => ({
  payloadGetAgentsDetail: { id: '' },

  agentsDetail: {
    status: 'loading',
    statusTitle: 'Gagal memuat agent',
    statusSubtitle: 'Coba muat ulang halaman ini.',
    data: null as DataAgentsDetail | null,
  },

  agentsRuns: {
    status: 'loading',
    statusTitle: 'Gagal memuat riwayat eksekusi',
    statusSubtitle: 'Coba muat ulang halaman ini.',
    data: null as DataAgentsRunHistory | null,
  },

  playgroundResult: null,

  setGetAgentsDetail: (payload) =>
    set((state) => ({
      payloadGetAgentsDetail: { ...state.payloadGetAgentsDetail, ...payload },
    })),

  setAgentsDetail: (agentsDetail) =>
    set((state) => ({ agentsDetail: { ...state.agentsDetail, ...agentsDetail } })),

  setAgentsRuns: (agentsRuns) =>
    set((state) => ({ agentsRuns: { ...state.agentsRuns, ...agentsRuns } })),

  setPlaygroundResult: (playgroundResult) => set({ playgroundResult }),
}))
