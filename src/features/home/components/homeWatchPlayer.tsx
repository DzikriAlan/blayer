'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { Maximize, Minimize, Pause, PictureInPicture2, Play, Volume2, VolumeX } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { getSecondsLabel } from '@/shared/lib/videoFormat'
import { getWatchProgress, postWatchProgress } from '@/shared/lib/watchPreferences'

interface Props {
  videoId: string
  embedUrl: string
  title: string
  onEnded?: () => void
}

// Document Picture-in-Picture (Chrome/Edge 116+). Video YouTube ada di iframe lintas-origin, jadi PiP
// bawaan elemen <video> tidak bisa dipakai; seluruh player dipindah ke jendela PiP sebagai gantinya.
interface DocumentPictureInPicture {
  requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>
}

const YOUTUBE_ORIGIN = 'https://www.youtube.com'
// Kode playerState dari YouTube: 0 = selesai, 1 = diputar, 3 = buffering
const STATE_ENDED = 0
const STATE_PLAYING = 1
const PLAYING_STATES = new Set([STATE_PLAYING, 3])
// Kalau autoplay bersuara ditolak browser, video diputar tanpa suara setelah jeda ini (hanya sekali di awal,
// dan hanya bila pengguna belum berinteraksi dengan halaman; video yang dibuka lewat klik tetap bersuara)
const MUTED_FALLBACK_MS = 1500
const PROGRESS_SAVE_MS = 5000
const RESUME_MIN_SECONDS = 5
const RESUME_END_MARGIN = 10
// Di layar sentuh tidak ada hover: ketukan pertama memunculkan kontrol selama waktu ini
const TOUCH_CONTROLS_MS = 3000
const PIP_SIZE = { width: 480, height: 270 }

interface PlayerInfo {
  playerState?: number
  currentTime?: number
  duration?: number
  muted?: boolean
}

// Player YouTube dengan controls=0. Iframe tidak menerima kursor (pointer-events-none), sehingga
// overlay hover YouTube tidak muncul; kontrol Blayer menumpang di bawah video dan hanya tampil saat
// video di-hover, dijeda, atau difokus. Perintah ke iframe lewat postMessage, protokol yang sama
// dengan IFrame API resmi YouTube.
export default function HomeWatchPlayer({ videoId, embedUrl, title, onEnded }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pointerTypeRef = useRef('mouse')
  // Posisi & durasi terakhir untuk disimpan saat halaman ditutup, tanpa memicu render ulang
  const progressRef = useRef({ time: 0, duration: 0 })
  const onEndedRef = useRef(onEnded)
  const [filters, setFilters] = useState(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getStartAt = () => {
      const saved = getWatchProgress(videoId)
      if (!saved || saved.time < RESUME_MIN_SECONDS) return 0
      // Video yang sudah selesai ditonton diputar dari awal lagi
      const isFinished = saved.duration > 0 && saved.time > saved.duration - RESUME_END_MARGIN
      return isFinished ? 0 : saved.time
    }
    const startAt = getStartAt()

    return {
      isReady: false,
      isPlaying: false,
      hasStarted: false,
      isMuted: false,
      // Dibisukan oleh cadangan autoplay, bukan oleh pengguna; klik pertama pada video membunyikannya lagi
      isAutoMuted: false,
      isFullscreen: false,
      isTouchActive: false,
      startAt,
      currentTime: startAt,
      duration: 0,
      seekPreview: -1,
      pipWindow: null as Window | null,
    }
  })

  const data = useMemo(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getEmbedSrc = () => {
      const params = new URLSearchParams({
        enablejsapi: '1',
        controls: '0',
        autoplay: '1',
        playsinline: '1',
        rel: '0',
        iv_load_policy: '3',
        disablekb: '1',
        fs: '0',
        origin: window.location.origin,
        ...(filters.startAt ? { start: String(filters.startAt) } : {}),
      })
      return `${embedUrl}?${params.toString()}`
    }

    const position = filters.seekPreview >= 0 ? filters.seekPreview : filters.currentTime
    const isPip = !!filters.pipWindow
    return {
      embedSrc: getEmbedSrc(),
      position,
      progressPercent: filters.duration > 0 ? Math.min(100, (position / filters.duration) * 100) : 0,
      timeLabel: `${getSecondsLabel(Math.floor(position))} / ${getSecondsLabel(Math.floor(filters.duration))}`,
      playLabel: filters.isPlaying ? 'Jeda' : 'Putar',
      muteLabel: filters.isMuted ? 'Bunyikan' : 'Bisukan',
      fullscreenLabel: filters.isFullscreen ? 'Keluar layar penuh' : 'Layar penuh',
      pipLabel: isPip ? 'Kembalikan ke halaman' : 'Picture-in-Picture',
      isSeekable: filters.duration > 0,
      isPip,
      canPip: 'documentPictureInPicture' in window,
      // Kontrol tetap terlihat saat video dijeda atau setelah ketukan di layar sentuh
      isControlsPinned: !filters.isPlaying || filters.isTouchActive,
    }
  }, [embedUrl, filters])

  // utilisasi penyimpan posisi; hanya membaca ref, jadi stabil per video dan aman sebagai dependency effect
  const postProgress = useCallback(() => {
    const { time, duration } = progressRef.current
    if (time <= 0) return
    postWatchProgress(videoId, { time, duration })
  }, [videoId])

  // utilisasi pengirim perintah ke player; dipakai beberapa handler di bawah
  const postCommand = (func: string, args: unknown[] = []) => {
    // id dan channel harus sama dengan pesan pembuka (listening), kalau tidak player mengabaikan perintahnya
    frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args, id: videoId, channel: 'widget' }), YOUTUBE_ORIGIN)
  }

  const editPlayback = () => {
    postCommand(filters.isPlaying ? 'pauseVideo' : 'playVideo')
  }

  const editPointerType = (event: ReactPointerEvent) => {
    pointerTypeRef.current = event.pointerType
  }

  // Klik area video: mouse langsung play/pause; sentuhan pertama hanya memunculkan kontrol
  const editVideoArea = () => {
    if (filters.isAutoMuted) {
      postCommand('unMute')
      if (!filters.isPlaying) postCommand('playVideo')
      setFilters((prev) => ({ ...prev, isMuted: false, isAutoMuted: false }))
      return
    }
    if (pointerTypeRef.current === 'touch' && filters.isPlaying && !filters.isTouchActive) {
      setFilters((prev) => ({ ...prev, isTouchActive: true }))
      return
    }
    editPlayback()
  }

  const editMute = () => {
    postCommand(filters.isMuted ? 'unMute' : 'mute')
    setFilters((prev) => ({ ...prev, isMuted: !prev.isMuted, isAutoMuted: false }))
  }

  const editSeekPreview = (seconds: number) => {
    setFilters((prev) => ({ ...prev, seekPreview: seconds }))
  }

  const submitSeek = () => {
    if (filters.seekPreview < 0) return
    postCommand('seekTo', [filters.seekPreview, true])
    setFilters((prev) => ({ ...prev, currentTime: prev.seekPreview, seekPreview: -1 }))
  }

  const editFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined)
    else await containerRef.current?.requestFullscreen().catch(() => undefined)
  }

  const editPip = async () => {
    // utilisasi wajib ditulis di dalam parent function
    // Salin CSS halaman (Tailwind) dan kelas tema ke jendela PiP agar tampilannya sama
    const patchPipDocument = (pip: Window) => {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          const style = pip.document.createElement('style')
          style.textContent = Array.from(sheet.cssRules, (rule) => rule.cssText).join('\n')
          pip.document.head.appendChild(style)
        } catch {
          if (!sheet.href) continue
          const link = pip.document.createElement('link')
          link.rel = 'stylesheet'
          link.href = sheet.href
          pip.document.head.appendChild(link)
        }
      }
      pip.document.title = title
      pip.document.documentElement.className = document.documentElement.className
      pip.document.body.className = 'm-0 bg-black overflow-hidden'
    }

    if (filters.pipWindow) {
      filters.pipWindow.close()
      return
    }

    const pipApi = (window as Window & { documentPictureInPicture?: DocumentPictureInPicture }).documentPictureInPicture
    if (!pipApi) return
    const pip = await pipApi.requestWindow(PIP_SIZE).catch(() => null)
    if (!pip) return

    patchPipDocument(pip)
    // Jendela PiP ditutup pengguna: kembalikan player ke halaman, lanjut dari detik terakhir
    pip.addEventListener('pagehide', () => {
      setFilters((prev) => ({ ...prev, pipWindow: null, hasStarted: false, startAt: Math.floor(progressRef.current.time) }))
    })
    // Iframe dibuat ulang di jendela baru, jadi lanjutkan dari posisi sekarang
    setFilters((prev) => ({ ...prev, pipWindow: pip, hasStarted: false, startAt: Math.floor(progressRef.current.time) }))
  }

  const loadPlayer = () => {
    // Meminta player mengirim status (waktu, durasi, play/pause) secara berkala
    frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: videoId, channel: 'widget' }), YOUTUBE_ORIGIN)
  }

  useEffect(() => {
    onEndedRef.current = onEnded
  }, [onEnded])

  // Pesan dari player masuk ke jendela induk iframe: halaman ini, atau jendela PiP saat aktif
  useEffect(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getInfo = (raw: unknown): PlayerInfo | null => {
      try {
        const message = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (message?.event === 'onReady') return {}
        return message?.event === 'infoDelivery' || message?.event === 'initialDelivery' ? (message.info as PlayerInfo) : null
      } catch {
        return null
      }
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== YOUTUBE_ORIGIN || event.source !== frameRef.current?.contentWindow) return
      const info = getInfo(event.data)
      if (!info) return

      if (info.currentTime !== undefined) progressRef.current.time = info.currentTime
      if (info.duration) progressRef.current.duration = info.duration
      if (info.playerState === STATE_ENDED) {
        const duration = progressRef.current.duration
        progressRef.current.time = duration
        postWatchProgress(videoId, { time: duration, duration })
        onEndedRef.current?.()
      }

      setFilters((prev) => ({
        ...prev,
        isReady: true,
        isPlaying: info.playerState === undefined ? prev.isPlaying : PLAYING_STATES.has(info.playerState),
        hasStarted: prev.hasStarted || info.playerState === STATE_PLAYING,
        isMuted: info.muted ?? prev.isMuted,
        currentTime: info.currentTime ?? prev.currentTime,
        duration: info.duration || prev.duration,
      }))
    }

    const targets = filters.pipWindow ? [window, filters.pipWindow] : [window]
    for (const target of targets) target.addEventListener('message', onMessage)
    return () => {
      for (const target of targets) target.removeEventListener('message', onMessage)
    }
  }, [videoId, filters.pipWindow])

  useEffect(() => {
    const onFullscreenChange = () => {
      setFilters((prev) => ({ ...prev, isFullscreen: document.fullscreenElement === containerRef.current }))
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  // Kontrol hasil ketukan di layar sentuh disembunyikan lagi setelah beberapa detik
  useEffect(() => {
    if (!filters.isTouchActive) return
    const timer = setTimeout(() => setFilters((prev) => ({ ...prev, isTouchActive: false })), TOUCH_CONTROLS_MS)
    return () => clearTimeout(timer)
  }, [filters.isTouchActive, filters.isPlaying])

  // Browser bisa menolak autoplay bersuara (mis. halaman dibuka langsung); putar tanpa suara sebagai cadangan.
  // Hanya sebelum video pernah berputar: jeda dari pengguna tidak boleh memutar ulang video.
  useEffect(() => {
    if (!filters.isReady || filters.hasStarted || filters.isPlaying) return
    const timer = setTimeout(() => {
      const frame = frameRef.current?.contentWindow
      // Halaman yang sudah diklik pengguna boleh memutar dengan suara, jadi cukup minta putar tanpa membisukan
      const hasUserActivation = !!navigator.userActivation?.hasBeenActive
      frame?.postMessage(JSON.stringify({ event: 'command', func: hasUserActivation ? 'unMute' : 'mute', args: [], id: videoId, channel: 'widget' }), YOUTUBE_ORIGIN)
      frame?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [], id: videoId, channel: 'widget' }), YOUTUBE_ORIGIN)
      if (!hasUserActivation) setFilters((prev) => ({ ...prev, isMuted: true, isAutoMuted: true }))
    }, MUTED_FALLBACK_MS)
    return () => clearTimeout(timer)
  }, [filters.isReady, filters.hasStarted, filters.isPlaying, videoId])

  // Simpan posisi berkala selama diputar dan sekali saat dijeda
  useEffect(() => {
    if (!filters.hasStarted) return
    if (!filters.isPlaying) return postProgress()
    const timer = setInterval(postProgress, PROGRESS_SAVE_MS)
    return () => clearInterval(timer)
  }, [filters.hasStarted, filters.isPlaying, postProgress])

  // Saat tab ditutup/di-refresh simpan posisi; saat player ditinggalkan simpan juga.
  // Iframe ikut dilepas React saat unmount, jadi suaranya berhenti bersamanya.
  useEffect(() => {
    window.addEventListener('pagehide', postProgress)
    return () => {
      window.removeEventListener('pagehide', postProgress)
      postProgress()
    }
  }, [postProgress])

  // Jendela PiP ditutup saat player ditinggalkan (pindah video atau halaman)
  useEffect(() => {
    const pip = filters.pipWindow
    return () => pip?.close()
  }, [filters.pipWindow])

  const controlButton =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'

  const player = (
    <div
      ref={containerRef}
      className={cn(
        'group relative w-full overflow-hidden bg-black',
        data.isPip ? 'h-screen' : 'aspect-video rounded-xl sm:rounded-2xl',
        '[&:fullscreen]:aspect-auto [&:fullscreen]:h-full [&:fullscreen]:rounded-none',
      )}
    >
      <iframe
        ref={frameRef}
        src={data.embedSrc}
        title={title}
        onLoad={loadPlayer}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 h-full w-full border-0"
      />
      <button
        type="button"
        onPointerDown={editPointerType}
        onClick={editVideoArea}
        onDoubleClick={data.isPip ? undefined : editFullscreen}
        aria-label={data.playLabel}
        className="absolute inset-0 h-full w-full cursor-pointer bg-transparent focus-visible:outline-none"
      />

      {/* Kontrol Blayer: tersembunyi saat video berjalan, muncul saat di-hover, difokus, atau dijeda */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-2 pb-1.5 pt-8 text-white transition-opacity duration-200 sm:px-3 sm:pb-2',
          'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
          data.isControlsPinned && 'opacity-100',
        )}
      >
        <div className="relative flex h-4 items-center">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 h-1 rounded-full bg-white/30">
            <div className="h-full rounded-full bg-[#ff0033]" style={{ width: `${data.progressPercent}%` }} />
          </div>
          <input
            type="range"
            aria-label="Posisi video"
            min={0}
            max={Math.max(1, Math.floor(filters.duration))}
            step={1}
            value={Math.floor(data.position)}
            disabled={!data.isSeekable}
            onChange={(event) => editSeekPreview(Number(event.target.value))}
            onPointerUp={submitSeek}
            onKeyUp={submitSeek}
            className="relative h-4 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-default [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#ff0033] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff0033]"
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={editPlayback} aria-label={data.playLabel} title={data.playLabel} className={controlButton}>
            {filters.isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </button>
          <button type="button" onClick={editMute} aria-label={data.muteLabel} title={data.muteLabel} className={controlButton}>
            {filters.isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <span className="ml-1 font-mono text-[11px] tabular-nums text-white/90 sm:text-xs">{data.timeLabel}</span>

          <div className="ml-auto flex items-center gap-1">
            {data.canPip ? (
              <button type="button" onClick={editPip} aria-label={data.pipLabel} title={data.pipLabel} aria-pressed={data.isPip} className={controlButton}>
                <PictureInPicture2 className="h-5 w-5" />
              </button>
            ) : null}
            {data.isPip ? null : (
              <button type="button" onClick={editFullscreen} aria-label={data.fullscreenLabel} title={data.fullscreenLabel} className={controlButton}>
                {filters.isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (!filters.pipWindow) return player

  return (
    <>
      {createPortal(player, filters.pipWindow.document.body)}
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl bg-muted p-4 text-center sm:rounded-2xl">
        <PictureInPicture2 className="h-8 w-8 text-muted-foreground" />
        <p className="m-0 text-sm text-muted-foreground">Video sedang diputar di jendela Picture-in-Picture.</p>
        <button
          type="button"
          onClick={editPip}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Kembalikan ke halaman
        </button>
      </div>
    </>
  )
}
