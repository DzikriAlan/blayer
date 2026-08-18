import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

interface MockImageProps {
  src: string
  alt: string
  className?: string
}

/**
 * next/image butuh loader dan optimizer yang tidak ada di jsdom.
 *
 * Mock ini merender <img> biasa dan membuang prop khas Next (unoptimized,
 * priority, sizes, width/height nol) supaya React tidak memperingatkan
 * atribut yang tidak dikenal DOM.
 */
vi.mock('next/image', () => ({
  default: ({ src, alt, className }: MockImageProps) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  ),
}))

afterEach(() => {
  cleanup()
})
