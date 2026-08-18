import { create } from 'zustand'
import type {
  Analysis,
  DataAnalysis,
  PayloadGetAnalysis,
  PayloadPostAnalysis,
} from '../types/analysisTypes'

interface AnalysisStore {
  payloadGetAnalysis: PayloadGetAnalysis
  payloadPostAnalysis: PayloadPostAnalysis
  analysis: Analysis
  setGetAnalysis: (payload: Partial<PayloadGetAnalysis>) => void
  setPostAnalysis: (payload: Partial<PayloadPostAnalysis>) => void
  setAnalysis: (analysis: Partial<Analysis>) => void
}

export const useAnalysisStates = create<AnalysisStore>((set) => ({
  payloadGetAnalysis: {
    formId: '',
  },

  payloadPostAnalysis: {
    formId: '',
  },

  analysis: {
    status: 'empty',
    statusTitle: 'Something went wrong',
    statusSubtitle: 'Please try again later.',
    data: null as DataAnalysis | null,
  },

  setGetAnalysis: (payload) =>
    set((state) => ({
      payloadGetAnalysis: { ...state.payloadGetAnalysis, ...payload },
    })),

  setPostAnalysis: (payload) =>
    set((state) => ({
      payloadPostAnalysis: { ...state.payloadPostAnalysis, ...payload },
    })),

  setAnalysis: (analysis) =>
    set((state) => ({ analysis: { ...state.analysis, ...analysis } })),
}))
