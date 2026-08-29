import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import FormsExplore from '@/features/forms/components/formsExplore'
import { useFormsStates } from '@/features/forms/states/formsStates'

const back = vi.fn()

vi.mock('next/router', () => ({
  useRouter: () => ({ query: {}, push: vi.fn(), back }),
}))

const setHistoryLength = (length: number) => {
  Object.defineProperty(window.history, 'length', {
    configurable: true,
    value: length,
  })
}

vi.mock('@/features/forms/controllers/formsControllers', () => ({
  useFormsControllers: () => ({ fetchFormsPublic: { refetch: vi.fn() } }),
}))

const getForm = (overrides: Record<string, unknown> = {}) => ({
  id: 'form-1',
  slug: 'form-satu',
  title: 'Form Satu',
  description: 'Penjelasan singkat',
  templateId: 'csat',
  image: '',
  totalFields: 6,
  totalResponses: 3,
  createdAt: '2026-08-01T00:00:00.000Z',
  ...overrides,
})

const setCatalogue = (data: ReturnType<typeof getForm>[]) => {
  useFormsStates.setState({
    formsPublic: {
      status: data.length ? 'success' : 'empty',
      statusTitle: '',
      statusSubtitle: '',
      data,
    },
  })
}

beforeEach(() => {
  setCatalogue([])
})

describe('halaman kategori', () => {
  it('TC-36a survei disajikan sebagai daftar bernomor dengan satuan pertanyaan', () => {
    setCatalogue([getForm({ templateId: 'csat', title: 'Survei Layanan' })])

    render(<FormsExplore templateId="csat" />)

    expect(
      screen.getByRole('heading', { name: /Survei Yang Bisa Kamu Isi/i, level: 1 })
    ).toBeInTheDocument()
    expect(screen.queryByText(/Survei Kepuasan/)).not.toBeInTheDocument()
    expect(screen.getByText(/06 PERTANYAAN/)).toBeInTheDocument()
    expect(screen.getByText(/03 RESPONDEN/)).toBeInTheDocument()
    expect(screen.getAllByText('Isi Survei').length).toBeGreaterThan(0)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('TC-36b acara disajikan sebagai poster memakai banner formnya', () => {
    setCatalogue([
      getForm({
        templateId: 'event-tech',
        title: 'Webinar Produk',
        image: 'https://contoh.test/banner.png',
      }),
    ])

    render(<FormsExplore templateId="event-tech" />)

    expect(screen.getByRole('img')).toHaveClass('object-contain')
    expect(screen.getByText(/03 TERDAFTAR/)).toBeInTheDocument()
    expect(screen.getByText(/01 ACARA TERBUKA/)).toBeInTheDocument()
    expect(screen.getAllByText('Daftar Acara').length).toBeGreaterThan(0)
  })


  it('TC-39 jumlah yang sudah ikut dipajang sebagai tumpukan wajah', () => {
    setCatalogue([
      getForm({ templateId: 'event-tech', title: 'Webinar Produk', totalResponses: 7 }),
    ])

    const { container } = render(<FormsExplore templateId="event-tech" />)

    expect(container.querySelectorAll('[data-facepile-face]').length).toBe(4)
    expect(screen.getByText('+3')).toBeInTheDocument()
    expect(screen.getByText(/07 TERDAFTAR/)).toBeInTheDocument()
  })

  it('TC-39 form yang belum diisi tidak menampilkan wajah sama sekali', () => {
    setCatalogue([
      getForm({ templateId: 'event-tech', title: 'Webinar Baru', totalResponses: 0 }),
    ])

    const { container } = render(<FormsExplore templateId="event-tech" />)

    expect(container.querySelectorAll('[data-facepile-face]').length).toBe(0)
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
    expect(screen.getByText(/00 TERDAFTAR/)).toBeInTheDocument()
  })

  it('TC-36e hanya form dari kategori itu yang tampil', () => {
    setCatalogue([
      getForm({ id: 'a', templateId: 'csat', title: 'Survei Layanan' }),
      getForm({ id: 'b', templateId: 'event-tech', title: 'Webinar Produk' }),
    ])

    render(<FormsExplore templateId="csat" />)

    expect(screen.getByText('Survei Layanan')).toBeInTheDocument()
    expect(screen.queryByText('Webinar Produk')).not.toBeInTheDocument()
    expect(screen.getByText(/01 SURVEI TERBUKA/)).toBeInTheDocument()
  })

  it('TC-36g halaman kategori tidak menawarkan pembuatan form', () => {
    setCatalogue([getForm({ templateId: 'event-tech', title: 'Webinar Produk' })])

    render(<FormsExplore templateId="event-tech" />)

    expect(screen.queryByText('Use Template')).not.toBeInTheDocument()
    expect(screen.queryByText(/Buat/i)).not.toBeInTheDocument()
  })

  it('TC-36f kategori yang tidak dikenal dijelaskan, bukan dibiarkan kosong', () => {
    setCatalogue([getForm()])

    render(<FormsExplore templateId="entah-apa" />)

    expect(screen.getByText('Kategori Tidak Ada')).toBeInTheDocument()
  })
})


describe('jalan kembali dari katalog kategori', () => {
  beforeEach(() => {
    back.mockClear()
    setHistoryLength(2)
  })

  it('TC-36c kembali ke halaman sebelumnya, bukan selalu ke halaman depan', async () => {
    const user = userEvent.setup()
    render(<FormsExplore templateId="event-tech" />)

    await user.click(
      screen.getByRole('link', { name: 'Kembali ke halaman sebelumnya' })
    )

    expect(back).toHaveBeenCalled()
  })

  it('TC-36c dibuka langsung dari tautan, tujuannya tetap ada', async () => {
    const user = userEvent.setup()
    setHistoryLength(1)
    render(<FormsExplore templateId="event-tech" />)

    const link = screen.getByRole('link', {
      name: 'Kembali ke halaman sebelumnya',
    })
    expect(link).toHaveAttribute('href', '/#kategori')

    await user.click(link)

    expect(back).not.toHaveBeenCalled()
  })

  it('TC-36c Semua Kategori tetap menuju daftar kategori', () => {
    render(<FormsExplore templateId="event-tech" />)

    expect(
      screen.getByRole('link', { name: /Semua Kategori/ })
    ).toHaveAttribute('href', '/#kategori')
  })
})
