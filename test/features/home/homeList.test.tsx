import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import HomeList from '@/features/home/components/homeList'

describe('beranda', () => {
  it('menampilkan judul, kategori, dan daftar video', () => {
    render(<HomeList />)

    expect(
      screen.getByRole('heading', { name: 'Indonesia Hari Ini', level: 2 })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Politik' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pengembangan Diri' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /ditonton/ }).length).toBe(12)
  })

  it('menyaring video saat kategori dipilih', async () => {
    render(<HomeList />)

    await userEvent.click(screen.getByRole('button', { name: 'Investasi' }))

    expect(screen.getAllByRole('link', { name: /ditonton/ }).length).toBe(2)
  })
})
