import { useEffect, useRef, useState } from 'react'

interface Options {
  /** Fire once and stop observing. Entrance animations should not replay. */
  once?: boolean
  /** Viewport inset, same syntax as IntersectionObserver rootMargin. */
  rootMargin?: string
  threshold?: number
}

/**
 * Reports whether the element has scrolled into view.
 *
 * Falls back to `true` when IntersectionObserver is missing (old browsers, and
 * jsdom in tests) so content never stays stuck at opacity 0 — a failed reveal
 * must degrade to "visible", never to "invisible".
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  once = true,
  rootMargin = '0px 0px -12% 0px',
  threshold = 0.15,
}: Options = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [once, rootMargin, threshold])

  return { ref, inView }
}
