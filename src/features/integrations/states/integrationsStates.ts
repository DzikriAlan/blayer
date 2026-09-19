import { create } from 'zustand'

import type {
  DataIntegrations,
  DataIntegrationsDetail,
  Integrations,
  IntegrationsDetail,
  PayloadGetIntegrationsDetail,
} from '../types/integrationsTypes'

interface IntegrationsStore {
  payloadGetIntegrationsDetail: PayloadGetIntegrationsDetail
  integrations: Integrations
  integrationsDetail: IntegrationsDetail
  setGetIntegrationsDetail: (
    payload: Partial<PayloadGetIntegrationsDetail>
  ) => void
  setIntegrations: (integrations: Partial<Integrations>) => void
  setIntegrationsDetail: (integrationsDetail: Partial<IntegrationsDetail>) => void
}

export const useIntegrationsStates = create<IntegrationsStore>((set) => ({
  payloadGetIntegrationsDetail: { id: '' },

  integrations: {
    status: 'loading',
    statusTitle: 'Gagal memuat integration',
    statusSubtitle: 'Coba muat ulang halaman ini.',
    data: [] as DataIntegrations[],
  },

  integrationsDetail: {
    status: 'loading',
    statusTitle: 'Gagal memuat integration',
    statusSubtitle: 'Coba muat ulang halaman ini.',
    data: null as DataIntegrationsDetail | null,
  },

  setGetIntegrationsDetail: (payload) =>
    set((state) => ({
      payloadGetIntegrationsDetail: {
        ...state.payloadGetIntegrationsDetail,
        ...payload,
      },
    })),

  setIntegrations: (integrations) =>
    set((state) => ({ integrations: { ...state.integrations, ...integrations } })),

  setIntegrationsDetail: (integrationsDetail) =>
    set((state) => ({
      integrationsDetail: { ...state.integrationsDetail, ...integrationsDetail },
    })),
}))
