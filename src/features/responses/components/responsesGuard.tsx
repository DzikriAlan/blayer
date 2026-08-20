'use client'

import { useEffect, useMemo, useState } from 'react'
import { Expand, ShieldAlert, TimerReset } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/components/ui/button'

/** Kombinasi tombol untuk buka tab/jendela baru, cari, cetak, simpan, dan devtools. */
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
  violationCount: number
  durationText: string
  onEditViolation: (reason: string) => void
}

export default function ResponsesGuard({
  isActive,
  violationCount,
  durationText,
  onEditViolation,
}: Props) {
  const [filters, setFilters] = useState({
    isFullscreen: false,
    lastReason: '',
  })

  const data = useMemo(() => {
    const getWarningText = () => {
      if (!violationCount) return 'Layar ujian terkunci. Jangan tinggalkan halaman ini.'
      return `Terdeteksi ${violationCount} kali keluar dari layar ujian${
        filters.lastReason ? ` (${filters.lastReason})` : ''
      }. Aktivitas ini tercatat dan dilaporkan bersama jawabanmu.`
    }

    return {
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
      isViolated: violationCount > 0,
      violationText: String(violationCount).padStart(2, '0'),
      warningText: getWarningText(),
      durationText,
    }
  }, [isActive, violationCount, filters.lastReason, filters.isFullscreen, durationText])

  const editViolation = (reason: string) => {
    setFilters((prev) => ({ ...prev, lastReason: reason }))
    onEditViolation(reason)
  }

  const loadFullscreen = () => {
    const getRequest = () => document.documentElement.requestFullscreen?.()
    getRequest()?.catch(() => undefined)
  }

  useEffect(() => {
    if (!isActive) return

    // Semua aksi menyalin, menempel, dan menu klik-kanan dimatikan.
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

    const getHidden = () => {
      if (document.visibilityState === 'hidden') editViolation('pindah tab')
    }

    // Pindah tab sudah tercatat lewat visibilitychange, jadi blur hanya
    // dihitung saat halaman masih terlihat — yaitu pindah aplikasi/jendela.
    const getBlur = () => {
      if (document.visibilityState === 'visible')
        editViolation('pindah aplikasi')
    }

    const getFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement
      setFilters((prev) => ({ ...prev, isFullscreen }))
      if (!isFullscreen) editViolation('keluar layar penuh')
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
    document.addEventListener('visibilitychange', getHidden)
    document.addEventListener('fullscreenchange', getFullscreenChange)
    window.addEventListener('blur', getBlur)
    window.addEventListener('beforeunload', getBeforeUnload)

    return () => {
      document.removeEventListener('contextmenu', getBlocked)
      document.removeEventListener('copy', getBlocked)
      document.removeEventListener('cut', getBlocked)
      document.removeEventListener('paste', getBlocked)
      document.removeEventListener('selectstart', getBlocked)
      document.removeEventListener('dragstart', getBlocked)
      document.removeEventListener('keydown', getBlockedKey)
      document.removeEventListener('visibilitychange', getHidden)
      document.removeEventListener('fullscreenchange', getFullscreenChange)
      window.removeEventListener('blur', getBlur)
      window.removeEventListener('beforeunload', getBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  if (!data.isVisible) return null

  return (
    <div
      className={cn(
        'sticky top-0 z-30 border-b-2 border-foreground px-5 py-4 sm:px-7',
        data.isViolated
          ? 'bg-primary text-primary-foreground'
          : 'bg-foreground text-background'
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="brutal-eyebrow flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" /> MODE UJIAN
        </span>
        <span aria-hidden className="brutal-hatch hidden flex-1 opacity-30 sm:block" />
        <span className="brutal-eyebrow flex items-center gap-2">
          <TimerReset className="h-4 w-4" /> {data.durationText}
        </span>
        <span className="brutal-eyebrow">PELANGGARAN {data.violationText}</span>
        {data.isFullscreen ? null : (
          <Button type="button" variant="paper" size="sm" onClick={loadFullscreen}>
            <Expand /> Layar Penuh
          </Button>
        )}
      </div>
      <p className="mt-3 font-mono text-xs leading-relaxed opacity-90">
        {data.warningText}
      </p>
    </div>
  )
}
