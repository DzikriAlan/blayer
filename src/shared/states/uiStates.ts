import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  selectedAgentId: string | null
  setSelectedAgentId: (id: string | null) => void
}

export const useUIStates = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  selectedAgentId: null,
  setSelectedAgentId: (id: string | null) => set({ selectedAgentId: id }),
}))
