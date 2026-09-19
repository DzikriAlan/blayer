import { useEffect, useRef, useState } from 'react'

const PREFERS_REDUCED = '(prefers-reduced-motion: reduce)'

/**
 * Eases a number from 0 to `target` once `active` turns true.
 *
 * Honours prefers-reduced-motion by snapping straight to the target — the
 * global CSS opt-out cannot reach a JS-driven counter, so it is repeated here.
 */
export function useCountUp(target: number, active: boolean, durationMs = 1200) {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number>()

  useEffect(() => {
    if (!active) return

    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.(PREFERS_REDUCED).matches

    if (reduced || durationMs <= 0) {
      setValue(target)
      return
    }

    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1)
      // easeOutCubic — fast off the mark, settles gently on the final value
      setValue(target * (1 - Math.pow(1 - t, 3)))
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, active, durationMs])

  return value
}
