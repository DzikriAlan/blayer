'use client'

import { useMemo, useState } from 'react'

import type {
  DataResponsesListField,
  DataResponsesListItem,
} from '../types/responsesTypes'
import { FORMS_TEMPLATES } from '@/features/forms/components/formsTemplate'

import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import ResponsesScoreRow from './responsesScoreRow'

const SCORABLE_TYPES = ['RATING', 'SCALE', 'CHECKBOX']
const CHOICE_TYPES = ['RADIO', 'SELECT', 'CHECKBOX']

const SCALE_MAX: Record<string, number> = { RATING: 5, SCALE: 10 }

interface Props {
  title: string
  templateId: string
  fields: DataResponsesListField[]
  responses: DataResponsesListItem[]
}

export default function ResponsesDashboard({
  title,
  templateId,
  fields,
  responses,
}: Props) {
  const [filters, setFilters] = useState({
    isBasisVisible: false,
    openRespondentId: '',
    pagination: {
      currentPage: 1,
      perPage: 10,
      totalItem: 0,
      totalPage: 0,
    },
  })

  const data = useMemo(() => {
    const getAnswer = (
      response: DataResponsesListItem,
      fieldId: string
    ): string | string[] => response.answers?.[fieldId] ?? ''

    const getIsAnswered = (answer: string | string[]) =>
      Array.isArray(answer)
        ? answer.length > 0
        : String(answer ?? '').trim() !== ''

    const getNumber = (answer: string | string[]) => {
      if (Array.isArray(answer)) return null
      const parsed = Number(String(answer).trim())
      return Number.isFinite(parsed) ? parsed : null
    }

    const getAnswerText = (answer: string | string[]) => {
      if (Array.isArray(answer)) return answer.join(', ') || '(tidak dijawab)'
      return String(answer ?? '').trim() || '(tidak dijawab)'
    }

    const getDurationText = (totalSecond: number) => {
      if (!totalSecond) return '—'
      const hour = Math.floor(totalSecond / 3600)
      const minute = Math.floor((totalSecond % 3600) / 60)
      const second = totalSecond % 60
      const parts = [minute, second].map((part) =>
        String(part).padStart(2, '0')
      )
      return hour ? `${String(hour).padStart(2, '0')}:${parts.join(':')}` : parts.join(':')
    }

    const getDateText = (value: string) =>
      new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

    const getResultView = () => {
      const template = FORMS_TEMPLATES.find((item) => item.id === templateId)

      if (['event', 'order'].includes(template?.view ?? ''))
        return 'registry'
      if (template?.view === 'survey') return 'summary'
      if (template) return 'scoring'

      const hasScorable = fields.some((field) =>
        SCORABLE_TYPES.includes(field.type)
      )
      return hasScorable ? 'scoring' : 'registry'
    }

    const getScoreRatios = (response: DataResponsesListItem) =>
      fields
        .filter((field) => SCORABLE_TYPES.includes(field.type))
        .map((field) => {
          const answer = getAnswer(response, field.id)

          if (field.type === 'CHECKBOX') {
            const total = field.options.length
            const picked = Array.isArray(answer) ? answer.length : 0
            return total ? picked / total : 0
          }

          const max = SCALE_MAX[field.type] ?? 0
          const value = getNumber(answer)
          if (value === null || !max) return null
          return Math.min(Math.max(value / max, 0), 1)
        })
        .filter((ratio): ratio is number => ratio !== null)

    const getCompleteness = (response: DataResponsesListItem) => {
      if (!fields.length) return 0
      const answered = fields.filter((field) =>
        getIsAnswered(getAnswer(response, field.id))
      ).length
      return Math.round((answered / fields.length) * 100)
    }

    const scorableFields = fields.filter((field) =>
      SCORABLE_TYPES.includes(field.type)
    )
    const hasScoreBasis = scorableFields.length > 0

    const rankedList = responses
      .map((response) => {
        const ratios = getScoreRatios(response)
        const completeness = getCompleteness(response)
        const score = ratios.length
          ? Math.round(
              (ratios.reduce((total, ratio) => total + ratio, 0) /
                ratios.length) *
                100
            )
          : completeness

        return {
          id: response.id,
          name: response.name || 'Anonim',
          email: response.email,
          createdAt: getDateText(response.createdAt),
          durationText: getDurationText(response.duration ?? 0),
          score,
          completeness,
          answers: fields.map((field) => ({
            fieldId: field.id,
            label: field.label,
            value: getAnswerText(getAnswer(response, field.id)),
          })),
        }
      })
      .sort((a, b) => b.score - a.score || b.completeness - a.completeness)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        isTop: index === 0,
      }))

    const groupField = fields.find(
      (field) => CHOICE_TYPES.includes(field.type) && field.options.length
    )
    const groups = groupField
      ? groupField.options.map((option) => {
          const count = responses.filter((response) => {
            const answer = getAnswer(response, groupField.id)
            return Array.isArray(answer)
              ? answer.includes(option)
              : String(answer) === option
          }).length
          return {
            label: option,
            count,
            percent: responses.length
              ? Math.round((count / responses.length) * 100)
              : 0,
          }
        })
      : []

    const averageScore = rankedList.length
      ? Math.round(
          rankedList.reduce((total, item) => total + item.score, 0) /
            rankedList.length
        )
      : 0

    const averageCompleteness = rankedList.length
      ? Math.round(
          rankedList.reduce((total, item) => total + item.completeness, 0) /
            rankedList.length
        )
      : 0

    const resultView = getResultView()

    const totalItem = rankedList.length
    const totalPage = Math.ceil(totalItem / filters.pagination.perPage) || 1
    const currentPage = Math.min(filters.pagination.currentPage, totalPage)
    const startIndex = (currentPage - 1) * filters.pagination.perPage
    const pagedList = rankedList.slice(
      startIndex,
      startIndex + filters.pagination.perPage
    )

    return {
      data: pagedList,
      exportList: rankedList,
      resultView,
      isLoading: false,
      isError: false,
      isEmpty: !responses.length,
      emptyTitle: 'Belum Ada Data',
      emptySubtitle: 'Dashboard akan terisi setelah ada jawaban yang masuk.',
      emptyImage: '/no-data.svg',
      pagination: { ...filters.pagination, totalItem, totalPage, currentPage },
      isFirstPage: currentPage <= 1,
      isLastPage: currentPage >= totalPage,
      rangeStart: totalItem ? startIndex + 1 : 0,
      rangeEnd: Math.min(startIndex + filters.pagination.perPage, totalItem),
      groups,
      groupLabel: groupField?.label ?? '',
      hasScoreBasis,
      scoreBasisLabels: scorableFields.map((field) => field.label),
      averageScore,
      averageCompleteness,
      totalResponses: responses.length,
      totalFields: fields.length,
      topName: rankedList[0]?.name ?? '-',
      isBasisVisible: filters.isBasisVisible,
      openRespondentId: filters.openRespondentId,
      showScore: resultView !== 'registry',
    }
  }, [
    templateId,
    fields,
    responses,
    filters.isBasisVisible,
    filters.openRespondentId,
    filters.pagination,
  ])

  const loadResponsesExport = () => {
    const getCsvCell = (value: string | number) => {
      const text = String(value ?? '')
      return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
    }

    const getHeader = () => ['Nama', 'Nilai', 'Waktu Pengerjaan']

    const getRows = () =>
      data.exportList.map((item) => [
        item.name,
        item.score,
        item.durationText,
      ])

    const getFileName = () => {
      const slug =
        title
          .toLowerCase()
          .replace(/\[demo\]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60) || 'hasil-form'
      const stamp = new Date().toISOString().slice(0, 10)
      return `${slug}-${stamp}.csv`
    }

    const csv = [getHeader(), ...getRows()]
        .map((row) => row.map(getCsvCell).join(','))
        .join('\r\n')

    const blob = new Blob([`﻿${csv}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = getFileName()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const loadRespondentPage = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      openRespondentId: '',
      pagination: { ...prev.pagination, currentPage: page },
    }))
  }

  const editBasisVisible = () => {
    setFilters((prev) => ({ ...prev, isBasisVisible: !prev.isBasisVisible }))
  }

  const loadRespondentDetail = (id: string) => {
    setFilters((prev) => ({
      ...prev,
      openRespondentId: prev.openRespondentId === id ? '' : id,
    }))
  }

  if (data.isEmpty) return null

  return (
    <div className="border-2 border-foreground">
      <div className="border-b-2 border-foreground bg-foreground px-5 py-6 text-background sm:px-7">
        <div className="flex flex-wrap items-stretch gap-3">
          <span className="brutal-eyebrow bg-primary px-3 py-2 text-primary-foreground">
            {data.showScore ? 'PERINGKAT' : 'REKAPITULASI'}
          </span>
          <span aria-hidden className="brutal-hatch flex-1 opacity-30" />
          <Button
            type="button"
            variant="paper"
            size="sm"
            onClick={loadResponsesExport}
          >
            <Download /> CSV
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
          <div>
            <p className="brutal-eyebrow opacity-70">RESPONDEN</p>
            <p className="mt-1.5 font-display text-3xl font-black leading-none">
              {String(data.totalResponses).padStart(2, '0')}
            </p>
          </div>
          <div>
            <p className="brutal-eyebrow opacity-70">PERTANYAAN</p>
            <p className="mt-1.5 font-display text-3xl font-black leading-none">
              {String(data.totalFields).padStart(2, '0')}
            </p>
          </div>
          {data.showScore ? (
            <>
              <div>
                <p className="brutal-eyebrow opacity-70">SKOR RATA-RATA</p>
                <p className="mt-1.5 font-display text-3xl font-black leading-none">
                  {data.averageScore}
                </p>
              </div>
              <div>
                <p className="brutal-eyebrow opacity-70">TERTINGGI</p>
                <p className="mt-1.5 break-words font-display text-lg font-black leading-tight">
                  {data.topName}
                </p>
              </div>
            </>
          ) : (
            <div>
              <p className="brutal-eyebrow opacity-70">KELENGKAPAN</p>
              <p className="mt-1.5 font-display text-3xl font-black leading-none">
                {data.averageCompleteness}%
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground bg-muted px-5 py-4 sm:px-7">
        <p className="brutal-eyebrow">
          {data.showScore
            ? `RESPONDEN — ${
                data.hasScoreBasis
                  ? `SKOR DARI ${data.scoreBasisLabels.length} PERTANYAAN TERUKUR`
                  : 'DIURUTKAN DARI KELENGKAPAN'
              }`
            : 'DAFTAR PESERTA'}
        </p>
        {data.showScore && data.hasScoreBasis ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={editBasisVisible}
          >
            {data.isBasisVisible ? 'Sembunyikan' : 'Dasar Skor'}
          </Button>
        ) : null}
      </div>

      {data.isBasisVisible ? (
        <div className="border-b-2 border-foreground bg-paper px-5 py-5 sm:px-7">
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            Skor adalah rata-rata dari pertanyaan berikut, masing-masing
            dinormalisasi ke 0–100. Pertanyaan pilihan ganda dan isian teks
            tidak ikut dihitung karena tidak punya kunci jawaban.
          </p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {data.scoreBasisLabels.map((label) => (
              <li key={label} className="font-mono text-xs">
                <span className="text-primary">{'> '}</span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {data.data.map((item) => (
        <ResponsesScoreRow
          key={item.id}
          id={item.id}
          rank={item.rank}
          name={item.name}
          email={item.email}
          createdAt={item.createdAt}
          durationText={item.durationText}
          score={item.score}
          showScore={data.showScore}
          answers={item.answers}
          isTop={item.isTop}
          isOpen={data.openRespondentId === item.id}
          onLoadDetail={loadRespondentDetail}
        />
      ))}

      {data.pagination.totalPage > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground bg-muted px-5 py-4 sm:px-7">
          <p className="brutal-eyebrow text-muted-foreground">
            {data.rangeStart}–{data.rangeEnd} DARI {data.pagination.totalItem}
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={data.isFirstPage}
              onClick={() => loadRespondentPage(data.pagination.currentPage - 1)}
            >
              Prev
            </Button>
            <span className="brutal-eyebrow">
              {String(data.pagination.currentPage).padStart(2, '0')} /{' '}
              {String(data.pagination.totalPage).padStart(2, '0')}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={data.isLastPage}
              onClick={() => loadRespondentPage(data.pagination.currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {data.resultView === 'registry' && data.groups.length ? (
        <div className="bg-paper px-5 py-6 sm:px-7">
          <p className="brutal-eyebrow text-muted-foreground">
            {data.groupLabel}
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {data.groups.map((group) => (
              <li
                key={group.label}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="break-words font-mono text-xs">
                  {group.label}
                </span>
                <span className="brutal-eyebrow shrink-0">
                  {group.count} · {group.percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
