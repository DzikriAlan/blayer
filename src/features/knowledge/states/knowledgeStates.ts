import { create } from 'zustand'

import type { DataKnowledge, Knowledge } from '../types/knowledgeTypes'

interface KnowledgeStore {
  knowledge: Knowledge
  setKnowledge: (knowledge: Partial<Knowledge>) => void
}

export const useKnowledgeStates = create<KnowledgeStore>((set) => ({
  knowledge: {
    status: 'loading',
    statusTitle: 'Gagal memuat dokumen',
    statusSubtitle: 'Coba muat ulang halaman ini.',
    data: [] as DataKnowledge[],
  },

  setKnowledge: (knowledge) =>
    set((state) => ({ knowledge: { ...state.knowledge, ...knowledge } })),
}))
