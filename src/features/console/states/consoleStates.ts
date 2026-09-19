import { create } from 'zustand'

interface ConsoleStore {
  token: string
  isReady: boolean
  setToken: (token: string) => void
  setReady: (isReady: boolean) => void
}

export const useConsoleStates = create<ConsoleStore>((set) => ({
  token: '',
  isReady: false,
  setToken: (token) => set({ token }),
  setReady: (isReady) => set({ isReady }),
}))
