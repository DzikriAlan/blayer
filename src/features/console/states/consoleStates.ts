import { create } from 'zustand'

interface ConsoleStore {
  token: string
  username: string
  isReady: boolean
  isDefaultCredentials: boolean
  setSession: (session: { token: string; username: string }) => void
  setReady: (isReady: boolean) => void
  setDefaultCredentials: (isDefaultCredentials: boolean) => void
  clearSession: () => void
}

export const useConsoleStates = create<ConsoleStore>((set) => ({
  token: '',
  username: '',
  isReady: false,
  isDefaultCredentials: false,

  setSession: ({ token, username }) => set({ token, username }),
  setReady: (isReady) => set({ isReady }),
  setDefaultCredentials: (isDefaultCredentials) => set({ isDefaultCredentials }),
  clearSession: () => set({ token: '', username: '', isDefaultCredentials: false }),
}))
