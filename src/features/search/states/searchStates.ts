import { create } from 'zustand'

import type { DataSearchGroup, PayloadGetSearch, SearchList } from '../types/searchTypes'

interface SearchStore {
  payloadGetSearchList: PayloadGetSearch[]
  searchList: SearchList
  setGetSearchList: (payload: PayloadGetSearch[]) => void
  setSearchList: (searchList: Partial<SearchList>) => void
}

export const useSearchStates = create<SearchStore>((set) => ({
  payloadGetSearchList: [],

  searchList: {
    status: 'loading',
    statusTitle: 'Video gagal dimuat',
    statusSubtitle: 'Periksa koneksi lalu coba lagi.',
    data: [] as DataSearchGroup[],
  },

  setGetSearchList: (payload) => set({ payloadGetSearchList: payload }),

  setSearchList: (searchList) =>
    set((state) => ({ searchList: { ...state.searchList, ...searchList } })),
}))
