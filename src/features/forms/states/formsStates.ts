import { create } from 'zustand'
import type {
  DataForms,
  DataFormsCreated,
  DataFormsDetail,
  Forms,
  FormsCreated,
  FormsDetail,
  PayloadGetFormsDetail,
  PayloadPostForms,
} from '../types/formsTypes'

interface FormsStore {
  payloadPostForms: PayloadPostForms
  payloadGetFormsDetail: PayloadGetFormsDetail
  forms: Forms
  formsDetail: FormsDetail
  formsCreated: FormsCreated
  setPostForms: (payload: Partial<PayloadPostForms>) => void
  setGetFormsDetail: (payload: Partial<PayloadGetFormsDetail>) => void
  setForms: (forms: Partial<Forms>) => void
  setFormsDetail: (formsDetail: Partial<FormsDetail>) => void
  setFormsCreated: (formsCreated: Partial<FormsCreated>) => void
}

export const useFormsStates = create<FormsStore>((set) => ({
  payloadPostForms: {
    title: '',
    description: '',
    purpose: '',
    templateId: '',
    isPublished: true,
    fields: [],
  },

  payloadGetFormsDetail: {
    id: '',
  },

  forms: {
    status: 'loading',
    statusTitle: 'Something went wrong',
    statusSubtitle: 'Please try again later.',
    data: [] as DataForms[],
  },

  formsDetail: {
    status: 'loading',
    statusTitle: 'Something went wrong',
    statusSubtitle: 'Please try again later.',
    data: null as DataFormsDetail | null,
  },

  formsCreated: {
    status: 'empty',
    statusTitle: 'Something went wrong',
    statusSubtitle: 'Please try again later.',
    data: null as DataFormsCreated | null,
  },

  setPostForms: (payload) =>
    set((state) => ({
      payloadPostForms: { ...state.payloadPostForms, ...payload },
    })),

  setGetFormsDetail: (payload) =>
    set((state) => ({
      payloadGetFormsDetail: { ...state.payloadGetFormsDetail, ...payload },
    })),

  setForms: (forms) => set((state) => ({ forms: { ...state.forms, ...forms } })),

  setFormsDetail: (formsDetail) =>
    set((state) => ({ formsDetail: { ...state.formsDetail, ...formsDetail } })),

  setFormsCreated: (formsCreated) =>
    set((state) => ({
      formsCreated: { ...state.formsCreated, ...formsCreated },
    })),
}))
