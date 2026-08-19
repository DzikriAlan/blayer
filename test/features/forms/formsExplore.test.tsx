import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import FormsExplore from '@/features/forms/components/formsExplore'
import { useFormsStates } from '@/features/forms/states/formsStates'

vi.mock('next/router', () => ({
  useRouter: () => ({ query: {}, push: vi.fn() }),
}))

// Komponen hanya membaca katalog dari store; query-nya tidak perlu ikut jalan.
vi.mock('@/features/forms/controllers/formsControllers', () => ({
  useFormsControllers: () => ({ fetchFormsPublic: { refetch: vi.fn() } }),
}))

const getForm = (overrides: Record<string, unknown> = {}) => ({
  id: 'form-1',
  title: 'Form Satu',
  description: 'Penjelasan singkat',
  templateId: 'exam',
  bannerUrl: '',
  priceAmount: 0,
  totalField: 6,
  totalResponse: 3,
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
  it('TC-36a ujian disajikan sebagai daftar bernomor dengan satuan soal', () => {
    setCatalogue([getForm({ templateId: 'exam', title: 'Ujian Matematika' })])

    render(<FormsExplore templateId="exam" />)

    // Judulnya menyebut yang bisa dilakukan pengunjung, bukan nama template.
    expect(
      screen.getByRole('heading', { name: /Ujian Yang Sedang Dibuka/i, level: 1 })
    ).toBeInTheDocument()
    expect(screen.queryByText(/Ujian Sekolah/)).not.toBeInTheDocument()
    expect(screen.getByText(/06 SOAL/)).toBeInTheDocument()
    expect(screen.getByText(/03 PESERTA/)).toBeInTheDocument()
    expect(screen.getAllByText('Kerjakan Ujian').length).toBeGreaterThan(0)
    // Daftar, bukan poster: tidak ada gambar sampul.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('TC-36b acara disajikan sebagai poster memakai banner formnya', () => {
    setCatalogue([
      getForm({
        templateId: 'event',
        title: 'Webinar Produk',
        bannerUrl: 'https://contoh.test/banner.png',
      }),
    ])

    render(<FormsExplore templateId="event" />)

    // Poster harus dimuat utuh — object-cover memotong tanggal dan tempat yang
    // biasanya tercetak di tepi banner.
    expect(screen.getByRole('img')).toHaveClass('object-contain')
    expect(screen.getByText(/03 TERDAFTAR/)).toBeInTheDocument()
    expect(screen.getByText(/01 ACARA TERBUKA/)).toBeInTheDocument()
    expect(screen.getAllByText('Daftar Acara').length).toBeGreaterThan(0)
  })

  it('TC-36c kelas berbayar memajang harganya di sampul', () => {
    setCatalogue([
      getForm({
        templateId: 'course',
        title: 'Kelas Desain',
        bannerUrl: 'https://contoh.test/kelas.png',
        priceAmount: 150000,
      }),
    ])

    render(<FormsExplore templateId="course" />)

    expect(screen.getByText('Rp150.000')).toBeInTheDocument()
    expect(screen.getAllByText('Ikut Kelas').length).toBeGreaterThan(0)
  })

  it('TC-36d menu restoran memakai satuan pilihan dan pesanan', () => {
    setCatalogue([
      getForm({ templateId: 'restaurant', title: 'Meja 04', totalField: 5 }),
    ])

    render(<FormsExplore templateId="restaurant" />)

    expect(screen.getByText(/05 PILIHAN/)).toBeInTheDocument()
    expect(screen.getByText(/03 PESANAN/)).toBeInTheDocument()
    expect(screen.getAllByText('Pesan Sekarang').length).toBeGreaterThan(0)
  })

  it('TC-36m psikotes disajikan seperti lowongan di job portal', () => {
    setCatalogue([
      getForm({
        templateId: 'psychometric',
        title: 'Frontend Engineer — PT Nusantara Digital',
        bannerUrl: 'https://contoh.test/logo.png',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      }),
    ])

    render(<FormsExplore templateId="psychometric" />)

    expect(
      screen.getByRole('heading', {
        name: /Lowongan Yang Sedang Membuka Psikotes/i,
        level: 1,
      })
    ).toBeInTheDocument()
    expect(screen.getByText(/01 LOWONGAN DIBUKA/)).toBeInTheDocument()
    expect(screen.getByText(/03 PELAMAR/)).toBeInTheDocument()
    // Umur lowongan dan logo perusahaan adalah yang dipindai pelamar lebih
    // dulu, jadi keduanya harus ada di kartunya.
    expect(screen.getByText('3 HARI LALU')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute(
      'alt',
      'Logo Frontend Engineer — PT Nusantara Digital'
    )
    expect(screen.getAllByText('Lamar & Kerjakan').length).toBeGreaterThan(0)
    // Judulnya dipangkas dua baris, jadi judul utuhnya tetap terbaca lewat
    // tooltip — judulnya saja, bukan sekalian keterangannya.
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute(
      'title',
      'Frontend Engineer — PT Nusantara Digital'
    )
    // Lowongan tidak berharga, jadi tidak ada label "Gratis" seperti di menu.
    expect(screen.queryByText('Gratis')).not.toBeInTheDocument()
  })

  it('TC-36p keterangan lowongan dipecah jadi chip yang bisa dipindai', () => {
    setCatalogue([
      getForm({
        templateId: 'psychometric',
        title: 'Data Analyst — Sentra Data Group',
        description:
          'Surabaya · Kerja di Kantor · Kontrak 12 Bulan · D3/S1 Statistika · Terbuka untuk lulusan baru. Psikotes menakar ketelitian.',
      }),
    ])

    render(<FormsExplore templateId="psychometric" />)

    ;[
      'Psikotes Terkunci',
      'Surabaya',
      'Kerja di Kantor',
      'Kontrak 12 Bulan',
      'D3/S1 Statistika',
      'Terbuka untuk lulusan baru',
    ].forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument()
    })

    // Kalimat setelah ruas chip tetap jadi paragraf, tidak ikut jadi chip.
    expect(screen.getByText('Psikotes menakar ketelitian.')).toBeInTheDocument()
  })

  it('TC-36q deskripsi biasa tidak dipaksa jadi chip', () => {
    setCatalogue([
      getForm({
        templateId: 'psychometric',
        title: 'Backend Engineer — Tanpa Ruas',
        description: 'Lowongan ini ditulis sebagai satu kalimat utuh saja.',
      }),
    ])

    render(<FormsExplore templateId="psychometric" />)

    expect(
      screen.getByText('Lowongan ini ditulis sebagai satu kalimat utuh saja.')
    ).toBeInTheDocument()
  })

  it('TC-38a proyek freelance memajang anggarannya di kepala kartu', () => {
    setCatalogue([
      getForm({
        templateId: 'freelance',
        title: 'Redesain Landing Page',
        description:
          'Web Development · Kerja Jarak Jauh · Estimasi 3 Minggu · Level Menengah. Aset desain sudah tersedia.',
        priceAmount: 4500000,
        totalField: 7,
      }),
    ])

    render(<FormsExplore templateId="freelance" />)

    expect(
      screen.getByRole('heading', {
        name: /Proyek Yang Bisa Kamu Garap/i,
        level: 1,
      })
    ).toBeInTheDocument()
    expect(screen.getByText('BUDGET')).toBeInTheDocument()
    expect(screen.getByText('Rp4.500.000')).toBeInTheDocument()
    expect(screen.getByText('Web Development')).toBeInTheDocument()
    expect(screen.getByText(/03 PENAWARAN/)).toBeInTheDocument()
    expect(screen.getByText(/07 ISIAN/)).toBeInTheDocument()
    expect(screen.getAllByText('Ajukan Penawaran').length).toBeGreaterThan(0)
  })

  it('TC-38b proyek tanpa anggaran ditandai masih bisa dinego', () => {
    setCatalogue([
      getForm({
        templateId: 'freelance',
        title: 'Penulisan Artikel SEO',
        priceAmount: 0,
      }),
    ])

    render(<FormsExplore templateId="freelance" />)

    expect(screen.getByText('Nego')).toBeInTheDocument()
    expect(screen.queryByText('Gratis')).not.toBeInTheDocument()
  })

  it('TC-36e hanya form dari kategori itu yang tampil', () => {
    setCatalogue([
      getForm({ id: 'a', templateId: 'exam', title: 'Ujian Matematika' }),
      getForm({ id: 'b', templateId: 'event', title: 'Webinar Produk' }),
    ])

    render(<FormsExplore templateId="exam" />)

    expect(screen.getByText('Ujian Matematika')).toBeInTheDocument()
    expect(screen.queryByText('Webinar Produk')).not.toBeInTheDocument()
    expect(screen.getByText(/01 UJIAN DIBUKA/)).toBeInTheDocument()
  })

  it('TC-36g halaman kategori tidak menawarkan pembuatan form', () => {
    setCatalogue([getForm({ templateId: 'event', title: 'Webinar Produk' })])

    render(<FormsExplore templateId="event" />)

    // Permukaan ini untuk yang datang ikut, bukan yang datang membangun.
    expect(screen.queryByText('Use Template')).not.toBeInTheDocument()
    expect(screen.queryByText(/Buat/i)).not.toBeInTheDocument()
  })

  it('TC-36f kategori yang tidak dikenal dijelaskan, bukan dibiarkan kosong', () => {
    setCatalogue([getForm()])

    render(<FormsExplore templateId="entah-apa" />)

    expect(screen.getByText('Kategori Tidak Ada')).toBeInTheDocument()
  })
})
