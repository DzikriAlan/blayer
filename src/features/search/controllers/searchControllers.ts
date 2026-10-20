import { useCallback, useEffect } from 'react'
import { useQueries } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import { useSearchStates } from '../states/searchStates'
import { getSearch } from '../services/searchServices'
import type { DataSearchGroup, DataSearchResult } from '../types/searchTypes'

export const useSearchControllers = () => {
  const { payloadGetSearchList, setSearchList } = useSearchStates()

  // combine hanya berjalan ulang saat hasil query berubah, jadi nilainya aman dipakai sebagai dependency effect
  const combineSearchList = useCallback(
    (results: UseQueryResult<DataSearchResult>[]) => ({
      isPending: results.some((result) => result.isPending),
      isAllError: results.length > 0 && results.every((result) => result.isError),
      errorMessage: results.find((result) => result.isError)?.error?.message ?? '',
      data: payloadGetSearchList.map<DataSearchGroup>((payload, index) => ({
        q: payload.q,
        items: results[index]?.data?.data ?? [],
      })),
      refetch: () => Promise.all(results.map((result) => result.refetch())),
    }),
    [payloadGetSearchList],
  )

  // Satu query per kategori; hasil tiap kategori di-cache terpisah sehingga
  // berpindah kategori tidak memanggil API lagi
  const fetchSearchList = useQueries({
    queries: payloadGetSearchList.map((payload) => ({
      queryKey: ['search', payload],
      queryFn: () => getSearch(payload),
      staleTime: 5 * 60 * 1000,
    })),
    combine: combineSearchList,
  })

  useEffect(() => {
    if (!payloadGetSearchList.length || fetchSearchList.isPending) return setSearchList({ status: 'loading' })

    if (fetchSearchList.isAllError) {
      return setSearchList({ status: 'error', statusSubtitle: fetchSearchList.errorMessage || 'Coba lagi nanti.', data: [] })
    }

    const hasItems = fetchSearchList.data.some((group) => group.items.length)
    setSearchList({ data: fetchSearchList.data, status: hasItems ? 'success' : 'empty' })
  }, [payloadGetSearchList, fetchSearchList, setSearchList])

  return { fetchSearchList }
}
