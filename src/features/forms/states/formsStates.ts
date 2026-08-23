import { create } from 'zustand'
import type {
  DataForms,
  DataFormsCreated,
  DataFormsPublic,
  DataFormsDetail,
  Forms,
  FormsCreated,
  FormsPublic,
  FormsDetail,
  PayloadGetFormsDetail,
  PayloadPostForms,
} from '../types/formsTypes'

interface FormsStore {
  payloadPostForms: PayloadPostForms
  payloadGetFormsDetail: PayloadGetFormsDetail
  forms: Forms
  formsPublic: FormsPublic
  formsDetail: FormsDetail
  formsCreated: FormsCreated
  setPostForms: (payload: Partial<PayloadPostForms>) => void
  setGetFormsDetail: (payload: Partial<PayloadGetFormsDetail>) => void
  setForms: (forms: Partial<Forms>) => void
  setFormsPublic: (formsPublic: Partial<FormsPublic>) => void
  setFormsDetail: (formsDetail: Partial<FormsDetail>) => void
  setFormsCreated: (formsCreated: Partial<FormsCreated>) => void
}

export const useFormsStates = create<FormsStore>((set) => ({
  payloadPostForms: {
    title: '',
    description: '',
    purpose: '',
    templateId: '',
    image: '',
    meeting: '',
    video: '',
    qrisImage: '',
    price: 0,
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

  formsPublic: {
    status: 'loading',
    statusTitle: 'Something went wrong',
    statusSubtitle: 'Please try again later.',
    data: [] as DataFormsPublic[],
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

  setFormsPublic: (formsPublic) =>
    set((state) => ({
      formsPublic: { ...state.formsPublic, ...formsPublic },
    })),

  setFormsDetail: (formsDetail) =>
    set((state) => ({ formsDetail: { ...state.formsDetail, ...formsDetail } })),

  setFormsCreated: (formsCreated) =>
    set((state) => ({
      formsCreated: { ...state.formsCreated, ...formsCreated },
    })),
}))
