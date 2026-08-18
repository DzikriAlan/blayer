import { create } from 'zustand'
import type {
  DataResponses,
  DataResponsesList,
  PayloadGetResponsesList,
  PayloadPostResponses,
  Responses,
  ResponsesList,
} from '../types/responsesTypes'

interface ResponsesStore {
  payloadPostResponses: PayloadPostResponses
  payloadGetResponsesList: PayloadGetResponsesList
  responses: Responses
  responsesList: ResponsesList
  setPostResponses: (payload: Partial<PayloadPostResponses>) => void
  setGetResponsesList: (payload: Partial<PayloadGetResponsesList>) => void
  setResponses: (responses: Partial<Responses>) => void
  setResponsesList: (responsesList: Partial<ResponsesList>) => void
}

export const useResponsesStates = create<ResponsesStore>((set) => ({
  payloadPostResponses: {
    formId: '',
    respondentName: '',
    respondentEmail: '',
    answers: {},
    durationSeconds: 0,
  },

  payloadGetResponsesList: {
    formId: '',
  },

  responses: {
    status: 'empty',
    statusTitle: 'Something went wrong',
    statusSubtitle: 'Please try again later.',
    data: null as DataResponses | null,
  },

  responsesList: {
    status: 'loading',
    statusTitle: 'Something went wrong',
    statusSubtitle: 'Please try again later.',
    data: null as DataResponsesList | null,
  },

  setPostResponses: (payload) =>
    set((state) => ({
      payloadPostResponses: { ...state.payloadPostResponses, ...payload },
    })),

  setGetResponsesList: (payload) =>
    set((state) => ({
      payloadGetResponsesList: { ...state.payloadGetResponsesList, ...payload },
    })),

  setResponses: (responses) =>
    set((state) => ({ responses: { ...state.responses, ...responses } })),

  setResponsesList: (responsesList) =>
    set((state) => ({
      responsesList: { ...state.responsesList, ...responsesList },
    })),
}))
