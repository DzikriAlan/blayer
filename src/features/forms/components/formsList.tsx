'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ArrowRight, Plus, Search } from 'lucide-react'

import type { DataForms } from '../types/formsTypes'
import { useFormsStates } from '../states/formsStates'
import { useFormsControllers } from '../controllers/formsControllers'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import SectionHead from '@/components/section-head'
import StatusView from '@/components/status-view'
import FormsCard from './formsCard'
import FormsTemplate from './formsTemplate'

export default function FormsList() {
  const router = useRouter()
  const { forms } = useFormsStates()
  const { fetchForms } = useFormsControllers()

  const [filters, setFilters] = useState({
    search: '',
    pagination: {
      currentPage: 1,
      perPage: 6,
      totalItem: 0,
      totalPage: 0,
    },
  })

  const data = useMemo(() => {
    const getFormattedDate = (value: string) =>
      new Date(value)
        .toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .toUpperCase()

    const getMappedItem = (item: DataForms) => ({
      id: item.id,
      title: item.title,
      purpose: item.purpose,
      isAiEnabled: item.isAiEnabled,
      status: item.isPublished ? 'LIVE' : 'DRAFT',
      totalField: item.totalField,
      totalResponse: item.totalResponse,
      createdAt: getFormattedDate(item.createdAt),
    })

    const keyword = filters.search.trim().toLowerCase()
    const filteredList = keyword
      ? forms.data.filter(
          (raw) =>
            raw.title.toLowerCase().includes(keyword) ||
            raw.purpose.toLowerCase().includes(keyword)
        )
      : forms.data

    const totalItem = filteredList.length
    const totalPage = Math.ceil(totalItem / filters.pagination.perPage) || 1
    const currentPage = Math.min(filters.pagination.currentPage, totalPage)
    const startIndex = (currentPage - 1) * filters.pagination.perPage
    const mappedList = filteredList
      .slice(startIndex, startIndex + filters.pagination.perPage)
      .map((raw) => getMappedItem(raw))

    const totalResponse = forms.data.reduce(
      (total, raw) => total + raw.totalResponse,
      0
    )

    return {
      data: mappedList,
      isLoading: forms.status === 'loading',
      isError: forms.status === 'error',
      isEmpty: forms.status === 'success' && !mappedList.length,
      emptyTitle: keyword ? 'No Match' : 'No Forms Yet',
      emptySubtitle: keyword
        ? `Tidak ada form yang cocok dengan "${filters.search}". Coba kata kunci lain.`
        : 'Mulai dengan membuat form pertama dan tentukan tujuannya agar AI bisa menganalisis jawaban yang masuk.',
      emptyImage: '/no-data.svg',
      errorTitle: 'Something Broke',
      errorSubtitle: forms.statusSubtitle,
      pagination: { ...filters.pagination, totalItem, totalPage, currentPage },
      startIndex,
      totalForm: forms.data.length,
      totalResponse,
      isFirstPage: currentPage <= 1,
      isLastPage: currentPage >= totalPage,
    }
  }, [filters, forms])

  const loadForms = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: page },
    }))
  }

  // Dari beranda, template diteruskan ke builder lewat query string.
  const loadFormsTemplate = (templateId: string) => {
    router.push(`/forms/create?template=${templateId}`)
  }

  const editFormsSearch = (search: string) => {
    setFilters((prev) => ({
      ...prev,
      search,
      pagination: { ...prev.pagination, currentPage: 1 },
    }))
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="border-2 border-foreground bg-paper">
        <SectionHead
          tag="SECTION 00"
          title={'Build it.\nRank it'}
          description={
            'Susun pertanyaannya seperti biasa.\nBegitu jawaban masuk, peserta langsung diberi skor dan diperingkat.\nNo nonsense.'
          }
          className="px-5 pt-6 sm:px-7"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3">
          <div className="border-b-2 border-r-2 border-foreground px-5 py-5 sm:border-b-0 sm:px-7">
            <p className="brutal-eyebrow text-muted-foreground">TOTAL FORMS</p>
            <p className="mt-2 font-display text-4xl font-black leading-none">
              {String(data.totalForm).padStart(2, '0')}
            </p>
          </div>
          <div className="border-b-2 border-foreground px-5 py-5 sm:border-b-0 sm:border-r-2 sm:px-7">
            <p className="brutal-eyebrow text-muted-foreground">RESPONSES</p>
            <p className="mt-2 font-display text-4xl font-black leading-none">
              {String(data.totalResponse).padStart(2, '0')}
            </p>
          </div>
          <div className="col-span-2 bg-primary px-5 py-5 text-primary-foreground sm:col-span-1 sm:px-7">
            <p className="brutal-eyebrow">SHOWING</p>
            <p className="mt-2 font-display text-4xl font-black leading-none">
              {String(data.pagination.totalItem).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t-2 border-foreground px-5 py-6 sm:px-7">
          <Button asChild size="lg">
            <Link href="/forms/create">
              <Plus /> New Form
            </Link>
          </Button>
          <div className="flex min-w-[200px] flex-1 items-center gap-3">
            <Search className="h-4 w-4 shrink-0" />
            <Input
              value={filters.search}
              onChange={(event) => editFormsSearch(event.target.value)}
              placeholder="Search title or purpose"
              aria-label="Cari form"
            />
          </div>
        </div>
      </section>

      {/* border-b datang dari FormsTemplate sendiri, jadi cukup tiga sisi di sini. */}
      <section className="border-x-2 border-t-2 border-foreground">
        <FormsTemplate activeId="" onLoadFormsTemplate={loadFormsTemplate} />
      </section>

      <div className="flex items-stretch gap-3">
        <span className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
          RIWAYAT FORM
        </span>
        <span aria-hidden className="brutal-hatch flex-1 opacity-20" />
        <span className="brutal-eyebrow flex items-center text-muted-foreground">
          {String(data.totalForm).padStart(2, '0')} TOTAL
        </span>
      </div>

      {data.isLoading ? (
        <div className="flex flex-col">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="mb-[-2px] h-40 w-full" />
          ))}
        </div>
      ) : null}

      {data.isError ? (
        <StatusView
          title={data.errorTitle}
          subtitle={data.errorSubtitle}
          image={data.emptyImage}
        >
          <Button onClick={() => fetchForms.refetch()}>Retry</Button>
        </StatusView>
      ) : null}

      {data.isEmpty ? (
        <StatusView
          title={data.emptyTitle}
          subtitle={data.emptySubtitle}
          image={data.emptyImage}
        >
          <Button asChild>
            <Link href="/forms/create">
              <Plus /> Create Form
            </Link>
          </Button>
        </StatusView>
      ) : null}

      {data.data.length ? (
        <section className="border-x-2 border-t-2 border-foreground">
          {data.data.map((item, index) => (
            <FormsCard
              key={item.id}
              index={data.startIndex + index}
              id={item.id}
              title={item.title}
              purpose={item.purpose}
              isAiEnabled={item.isAiEnabled}
              status={item.status}
              totalField={item.totalField}
              totalResponse={item.totalResponse}
              createdAt={item.createdAt}
            />
          ))}
        </section>
      ) : null}

      {data.pagination.totalPage > 1 ? (
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={data.isFirstPage}
            onClick={() => loadForms(data.pagination.currentPage - 1)}
          >
            Prev
          </Button>
          <span className="brutal-eyebrow">
            {String(data.pagination.currentPage).padStart(2, '0')} /{' '}
            {String(data.pagination.totalPage).padStart(2, '0')}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data.isLastPage}
            onClick={() => loadForms(data.pagination.currentPage + 1)}
          >
            Next <ArrowRight />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
