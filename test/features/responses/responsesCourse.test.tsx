import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ResponsesCourse from '@/features/responses/components/responsesCourse'

const renderCourse = (
  props: Partial<Parameters<typeof ResponsesCourse>[0]> = {}
) =>
  render(
    <ResponsesCourse
      formId="form-1"
      title="Kelas Online — Dasar Membangun Web"
      description="Rekaman bisa diulang kapan saja."
      bannerUrl=""
      videoUrl="https://www.youtube.com/watch?v=aircAruvnKk"
      respondentName="Nabila Az-Zahra"
      items={[]}
      amount={350000}
      paymentMethod="QRIS"
      {...props}
    />
  )

describe('halaman akses kelas', () => {
  it('TC-22 video YouTube diputar langsung di halaman', () => {
    renderCourse()

    const frame = screen.getByTitle(
      'Video materi Kelas Online — Dasar Membangun Web'
    )

    expect(frame).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/aircAruvnKk'
    )
  })

  it('TC-22 tautan youtu.be pendek ikut dikenali', () => {
    renderCourse({ videoUrl: 'https://youtu.be/Oe421EPjeBE' })

    expect(
      screen.getByTitle('Video materi Kelas Online — Dasar Membangun Web')
    ).toHaveAttribute('src', 'https://www.youtube.com/embed/Oe421EPjeBE')
  })

  it('TC-22 penyedia lain disajikan sebagai tautan, bukan iframe', () => {
    renderCourse({ videoUrl: 'https://vimeo.com/123456789' })

    expect(
      screen.queryByTitle('Video materi Kelas Online — Dasar Membangun Web')
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /vimeo\.com\/123456789/ })
    ).toHaveAttribute('href', 'https://vimeo.com/123456789')
  })

  it('TC-22 tanpa tautan video, peserta diberi tahu pembayarannya tetap tercatat', () => {
    renderCourse({ videoUrl: '' })

    expect(screen.getByText(/belum mencantumkan tautan/i)).toBeInTheDocument()
  })

  it('TC-20 nominal yang dibayar dan metodenya ikut ditampilkan', () => {
    renderCourse()

    expect(screen.getByText('TOTAL DIBAYAR')).toBeInTheDocument()
    expect(screen.getAllByText('Rp350.000').length).toBeGreaterThan(0)
    expect(screen.getByText('QRIS')).toBeInTheDocument()
  })

  it('TC-22 kelas tercatat atas nama pendaftarnya', () => {
    renderCourse()

    expect(screen.getByText('Nabila Az-Zahra')).toBeInTheDocument()
  })
})
