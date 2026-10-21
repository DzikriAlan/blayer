import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import { HOME_CATEGORIES } from '@/features/home/components/homeCatalog'
import { useSearchStates } from '../states/searchStates'
import { getSearchList } from '../services/searchServices'
import type { DataSearchGroup } from '../types/searchTypes'

export const useSearchControllers = () => {
  const { setSearchList } = useSearchStates()

  // Satu query untuk seluruh kategori; isinya dibaca dari localStorage selama data hari ini sudah ada
  const fetchSearchList = useQuery({
    queryKey: ['search', 'list'],
    queryFn: () => getSearchList(),
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (fetchSearchList.isPending) return setSearchList({ status: 'loading' })

    if (fetchSearchList.isError) {
      return setSearchList({ status: 'error', statusSubtitle: fetchSearchList.error.message || 'Coba lagi nanti.', data: [] })
    }

    const videos = fetchSearchList.data ?? []
    const data = HOME_CATEGORIES.map<DataSearchGroup>((name) => ({
      key: name,
      items: videos.filter((video) => video.category === name),
    }))
    setSearchList({ data, status: videos.length ? 'success' : 'empty' })
  }, [fetchSearchList.isPending, fetchSearchList.isError, fetchSearchList.error, fetchSearchList.data, setSearchList])

  return { fetchSearchList }
}
