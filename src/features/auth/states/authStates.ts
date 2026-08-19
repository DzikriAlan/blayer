import { create } from 'zustand'
import type {
  AuthSession,
  DataAuthSession,
  PayloadPostAuthSession,
} from '../types/authTypes'

interface AuthStore {
  payloadPostAuthSession: PayloadPostAuthSession
  authSession: AuthSession
  setPostAuthSession: (payload: Partial<PayloadPostAuthSession>) => void
  setAuthSession: (authSession: Partial<AuthSession>) => void
}

export const useAuthStates = create<AuthStore>((set) => ({
  payloadPostAuthSession: {
    next: '',
  },

  authSession: {
    status: 'loading',
    statusTitle: 'Something went wrong',
    statusSubtitle: 'Please try again later.',
    data: null as DataAuthSession | null,
  },

  setPostAuthSession: (payload) =>
    set((state) => ({
      payloadPostAuthSession: { ...state.payloadPostAuthSession, ...payload },
    })),

  setAuthSession: (authSession) =>
    set((state) => ({
      authSession: { ...state.authSession, ...authSession },
    })),
}))
