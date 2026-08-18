import { create } from 'zustand'
import type {
  DataUploadsBanner,
  PayloadPostUploadsBanner,
  UploadsBanner,
} from '../types/uploadsTypes'

interface UploadsStore {
  payloadPostUploadsBanner: PayloadPostUploadsBanner
  uploadsBanner: UploadsBanner
  setPostUploadsBanner: (payload: Partial<PayloadPostUploadsBanner>) => void
  setUploadsBanner: (uploadsBanner: Partial<UploadsBanner>) => void
}

export const useUploadsStates = create<UploadsStore>((set) => ({
  payloadPostUploadsBanner: {
    fileName: '',
    contentType: '',
    fileBase64: '',
  },

  uploadsBanner: {
    status: 'empty',
    statusTitle: 'Something went wrong',
    statusSubtitle: 'Please try again later.',
    data: null as DataUploadsBanner | null,
  },

  setPostUploadsBanner: (payload) =>
    set((state) => ({
      payloadPostUploadsBanner: {
        ...state.payloadPostUploadsBanner,
        ...payload,
      },
    })),

  setUploadsBanner: (uploadsBanner) =>
    set((state) => ({
      uploadsBanner: { ...state.uploadsBanner, ...uploadsBanner },
    })),
}))
