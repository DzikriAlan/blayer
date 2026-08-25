'use client'

import { useEffect, useMemo, useState } from 'react'
import { Expand, ShieldAlert, TimerReset } from 'lucide-react'

import { Button } from '@/components/ui/button'

const BLOCKED_KEYS = [
  't',
  'n',
  'w',
  'f',
  'p',
  's',
  'u',
  'c',
  'x',
  'v',
  'a',
  'j',
  'i',
]

interface Props {
  isActive: boolean
  durationText: string
}

export default function ResponsesGuard({ isActive, durationText }: Props) {
  const [filters, setFilters] = useState({
    isFullscreen: false,
  })

  const data = useMemo(
    () => ({
      data: [],
      isLoading: false,
      isError: false,
      isEmpty: false,
      emptyTitle: '',
      emptySubtitle: '',
      emptyImage: '',
      pagination: { currentPage: 1, perPage: 0 },
      isVisible: isActive,
      isFullscreen: filters.isFullscreen,
      durationText,
    }),
    [isActive, filters.isFullscreen, durationText]
  )

  const loadFullscreen = () => {
    const getRequest = () => document.documentElement.requestFullscreen?.()
    getRequest()?.catch(() => undefined)
  }

  useEffect(() => {
    if (!isActive) return

    const getBlocked = (event: Event) => event.preventDefault()

    const getBlockedKey = (event: KeyboardEvent) => {
      const isModified = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      if (key === 'f12' || (isModified && event.shiftKey)) {
        event.preventDefault()
        return
      }
      if (isModified && BLOCKED_KEYS.includes(key)) event.preventDefault()
    }

    const getFullscreenChange = () => {
      setFilters((prev) => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }))
    }

    const getBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    document.addEventListener('contextmenu', getBlocked)
    document.addEventListener('copy', getBlocked)
    document.addEventListener('cut', getBlocked)
    document.addEventListener('paste', getBlocked)
    document.addEventListener('selectstart', getBlocked)
    document.addEventListener('dragstart', getBlocked)
    document.addEventListener('keydown', getBlockedKey)
    document.addEventListener('fullscreenchange', getFullscreenChange)
    window.addEventListener('beforeunload', getBeforeUnload)

    return () => {
      document.removeEventListener('contextmenu', getBlocked)
      document.removeEventListener('copy', getBlocked)
      document.removeEventListener('cut', getBlocked)
      document.removeEventListener('paste', getBlocked)
      document.removeEventListener('selectstart', getBlocked)
      document.removeEventListener('dragstart', getBlocked)
      document.removeEventListener('keydown', getBlockedKey)
      document.removeEventListener('fullscreenchange', getFullscreenChange)
      window.removeEventListener('beforeunload', getBeforeUnload)
    }
  }, [isActive])

  if (!data.isVisible) return null

  return (
    <div className="sticky top-0 z-30 border-b-2 border-foreground bg-foreground px-5 py-4 text-background sm:px-7">
      <div className="flex flex-wrap items-center gap-3">
        <span className="brutal-eyebrow flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" /> MODE UJIAN
        </span>
        <span aria-hidden className="brutal-hatch hidden flex-1 opacity-30 sm:block" />
        <span className="brutal-eyebrow flex items-center gap-2">
          <TimerReset className="h-4 w-4" /> {data.durationText}
        </span>
        {data.isFullscreen ? null : (
          <Button type="button" variant="paper" size="sm" onClick={loadFullscreen}>
            <Expand /> Layar Penuh
          </Button>
        )}
      </div>
    </div>
  )
}
