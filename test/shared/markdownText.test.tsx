import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import MarkdownText from '@/components/markdown-text'

const getHashtagHref = (tag: string) => `https://www.youtube.com/hashtag/${tag.toLowerCase()}`

describe('deskripsi markdown', () => {
  it('menebalkan teks dan menyusun daftar', () => {
    const { container } = render(
      <MarkdownText text={'**Topik yang dibahas:**\n- Emerging Market\n- Frontier Market\n\n1. Satu\n2. Dua'} />,
    )

    expect(screen.getByText('Topik yang dibahas:').tagName).toBe('STRONG')
    expect(container.querySelectorAll('ul > li')).toHaveLength(2)
    expect(container.querySelectorAll('ol > li')).toHaveLength(2)
    expect(container.textContent).not.toContain('**')
  })

  it('membuat link dan tagar bisa diklik dengan warna biru', () => {
    render(<MarkdownText text="Tonton: https://youtu.be/abc. #BeritaSatu dan [situs kami](https://beritasatu.com)" getHashtagHref={getHashtagHref} />)

    const url = screen.getByRole('link', { name: 'https://youtu.be/abc' })
    expect(url).toHaveAttribute('href', 'https://youtu.be/abc')
    expect(url.className).toContain('text-blue-600')

    expect(screen.getByRole('link', { name: '#BeritaSatu' })).toHaveAttribute('href', 'https://www.youtube.com/hashtag/beritasatu')
    expect(screen.getByRole('link', { name: 'situs kami' })).toHaveAttribute('href', 'https://beritasatu.com')
  })

  it('menampilkan HTML sebagai teks biasa, bukan elemen', () => {
    const { container } = render(<MarkdownText text={'<img src=x onerror="alert(1)"> <script>alert(1)</script>'} />)

    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('script')).toBeNull()
    expect(container.textContent).toContain('<script>alert(1)</script>')
  })

  it('mengubah baris garis panjang menjadi pemisah', () => {
    const { container } = render(<MarkdownText text={'Atas\n------------------------\nBawah'} />)

    expect(container.querySelector('hr')).not.toBeNull()
  })
})
