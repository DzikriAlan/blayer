'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react'

import { getLocalCache, postLocalCache } from '@/shared/lib/localCache'
import { getSecondsLabel } from '@/shared/lib/videoFormat'

interface Props {
  videoId: string
  embedUrl: string
  title: string
}

const YOUTUBE_ORIGIN = 'https://www.youtube.com'
// Kode playerState dari YouTube: 0 = selesai, 1 = diputar, 3 = buffering
const STATE_ENDED = 0
const STATE_PLAYING = 1
const PLAYING_STATES = new Set([STATE_PLAYING, 3])
// Kalau autoplay bersuara ditolak browser, video diputar tanpa suara setelah jeda ini (hanya sekali di awal)
const MUTED_FALLBACK_MS = 1500
// Posisi tonton per video disimpan di localStorage agar refresh melanjutkan dari detik terakhir
const PROGRESS_KEY = 'watch-progress:'
const PROGRESS_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const PROGRESS_SAVE_MS = 5000
const RESUME_MIN_SECONDS = 5
const RESUME_END_MARGIN = 10

interface PlayerInfo {
  playerState?: number
  currentTime?: number
  duration?: number
  muted?: boolean
}

// Player YouTube dengan controls=0. Iframe tidak menerima kursor (pointer-events-none), sehingga
// overlay hover YouTube (judul, tombol tengah, "Video lainnya") tidak muncul selama video diputar;
// tampilan player sendiri tidak ditutupi atau diubah. Klik di area video ditangkap tombol transparan
// Blayer untuk play/pause. Kontrol lain ada di bar bawah dan bicara ke iframe lewat postMessage,
// protokol yang sama dengan IFrame API resmi YouTube.
export default function HomeWatchPlayer({ videoId, embedUrl, title }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // Posisi & durasi terakhir untuk disimpan saat halaman ditutup, tanpa memicu render ulang
  const progressRef = useRef({ time: 0, duration: 0 })
  const [filters, setFilters] = useState(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getSavedPosition = () => (typeof window === 'undefined' ? 0 : getLocalCache<number>(PROGRESS_KEY + videoId, PROGRESS_MAX_AGE_MS) ?? 0)
    const saved = getSavedPosition()

    return {
      isReady: false,
      isPlaying: false,
      hasStarted: false,
      isMuted: false,
      isFullscreen: false,
      startAt: saved >= RESUME_MIN_SECONDS ? saved : 0,
      currentTime: saved >= RESUME_MIN_SECONDS ? saved : 0,
      duration: 0,
      seekPreview: -1,
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
        origin: typeof window === 'undefined' ? '' : window.location.origin,
        ...(filters.startAt ? { start: String(filters.startAt) } : {}),
      })
      return `${embedUrl}?${params.toString()}`
    }

    const position = filters.seekPreview >= 0 ? filters.seekPreview : filters.currentTime
    return {
      embedSrc: getEmbedSrc(),
      position,
      timeLabel: `${getSecondsLabel(Math.floor(position))} / ${getSecondsLabel(Math.floor(filters.duration))}`,
      playLabel: filters.isPlaying ? 'Jeda' : 'Putar',
      muteLabel: filters.isMuted ? 'Bunyikan' : 'Bisukan',
      fullscreenLabel: filters.isFullscreen ? 'Keluar layar penuh' : 'Layar penuh',
      isSeekable: filters.duration > 0,
    }
  }, [embedUrl, filters])

  // utilisasi penyimpan posisi; video yang sudah hampir selesai disimpan sebagai 0 agar mulai dari awal lagi.
  // Hanya membaca ref, jadi fungsinya stabil per video dan aman dipakai sebagai dependency effect.
  const postProgress = useCallback(() => {
    const { time, duration } = progressRef.current
    if (time <= 0) return
    const isFinished = duration > 0 && time > duration - RESUME_END_MARGIN
    postLocalCache(PROGRESS_KEY + videoId, isFinished ? 0 : Math.floor(time))
  }, [videoId])

  // utilisasi pengirim perintah ke player; dipakai beberapa handler di bawah
  const postCommand = (func: string, args: unknown[] = []) => {
    // id dan channel harus sama dengan pesan pembuka (listening), kalau tidak player mengabaikan perintahnya
    frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args, id: videoId, channel: 'widget' }), YOUTUBE_ORIGIN)
  }

  const editPlayback = () => {
    postCommand(filters.isPlaying ? 'pauseVideo' : 'playVideo')
  }

  const editMute = () => {
    postCommand(filters.isMuted ? 'unMute' : 'mute')
    setFilters((prev) => ({ ...prev, isMuted: !prev.isMuted }))
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

  const loadPlayer = () => {
    // Meminta player mengirim status (waktu, durasi, play/pause) secara berkala
    frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: videoId, channel: 'widget' }), YOUTUBE_ORIGIN)
  }

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
      if (info.playerState === STATE_ENDED) postLocalCache(PROGRESS_KEY + videoId, 0)

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

    const onFullscreenChange = () => {
      setFilters((prev) => ({ ...prev, isFullscreen: document.fullscreenElement === containerRef.current }))
    }

    window.addEventListener('message', onMessage)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      window.removeEventListener('message', onMessage)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [videoId])

  // Browser bisa menolak autoplay bersuara (mis. halaman dibuka langsung); putar tanpa suara sebagai cadangan.
  // Hanya sebelum video pernah berputar: jeda dari pengguna tidak boleh memutar ulang video.
  useEffect(() => {
    if (!filters.isReady || filters.hasStarted || filters.isPlaying) return
    const timer = setTimeout(() => {
      const frame = frameRef.current?.contentWindow
      frame?.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [], id: videoId, channel: 'widget' }), YOUTUBE_ORIGIN)
      frame?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [], id: videoId, channel: 'widget' }), YOUTUBE_ORIGIN)
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

  // Saat tab ditutup/di-refresh simpan posisi; saat player ditinggalkan (pindah video atau halaman)
  // hentikan video lebih dulu supaya tidak ada suara yang tersisa di latar
  useEffect(() => {
    const frame = frameRef.current
    window.addEventListener('pagehide', postProgress)
    return () => {
      window.removeEventListener('pagehide', postProgress)
      postProgress()
      frame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [], id: videoId, channel: 'widget' }), YOUTUBE_ORIGIN)
      frame?.setAttribute('src', 'about:blank')
    }
  }, [videoId, postProgress])

  return (
    <div ref={containerRef} className="flex flex-col overflow-hidden rounded-xl bg-black sm:rounded-2xl [&:fullscreen]:h-full [&:fullscreen]:rounded-none">
      <div className="relative aspect-video w-full [:fullscreen_&]:aspect-auto [:fullscreen_&]:flex-1">
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
          onClick={editPlayback}
          onDoubleClick={editFullscreen}
          aria-label={data.playLabel}
          className="absolute inset-0 h-full w-full cursor-pointer bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
        />
      </div>

      <div className="flex items-center gap-2 bg-[#0d0d10] px-2 py-1.5 text-white sm:gap-3 sm:px-3">
        <button
          type="button"
          onClick={editPlayback}
          aria-label={data.playLabel}
          title={data.playLabel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {filters.isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
        </button>

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
          className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[hsl(var(--primary))] disabled:cursor-default"
        />

        <span className="shrink-0 font-mono text-[11px] tabular-nums text-white/80 sm:text-xs">{data.timeLabel}</span>

        <button
          type="button"
          onClick={editMute}
          aria-label={data.muteLabel}
          title={data.muteLabel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {filters.isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>

        <button
          type="button"
          onClick={editFullscreen}
          aria-label={data.fullscreenLabel}
          title={data.fullscreenLabel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {filters.isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
