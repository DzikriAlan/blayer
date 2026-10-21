import { create } from 'zustand'

import type { DataSearchGroup, SearchList } from '../types/searchTypes'

interface SearchStore {
  searchList: SearchList
  setSearchList: (searchList: Partial<SearchList>) => void
}

export const useSearchStates = create<SearchStore>((set) => ({
  searchList: {
    status: 'loading',
    statusTitle: 'Video gagal dimuat',
    statusSubtitle: 'Periksa koneksi lalu coba lagi.',
    data: [] as DataSearchGroup[],
  },

  setSearchList: (searchList) =>
    set((state) => ({ searchList: { ...state.searchList, ...searchList } })),
}))
