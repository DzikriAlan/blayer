import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  DataFormsDetail,
  DataFormsDetailField,
} from '@/features/forms/types/formsTypes'

const setGetFormsDetail = vi.fn()
const mutate = vi.fn()
const refetchFormsDetail = vi.fn()

const state = {
  formsDetail: {
    status: 'success',
    statusTitle: '',
    statusSubtitle: '',
    data: null as DataFormsDetail | null,
  },
  responses: {
    status: 'empty',
    statusTitle: '',
    statusSubtitle: '',
    data: null,
  },
}

vi.mock('@/features/forms/states/formsStates', () => ({
  useFormsStates: () => ({
    formsDetail: state.formsDetail,
    setGetFormsDetail,
  }),
}))

vi.mock('@/features/forms/controllers/formsControllers', () => ({
  useFormsControllers: () => ({
    fetchFormsDetail: { refetch: refetchFormsDetail },
  }),
}))

vi.mock('@/features/responses/states/responsesStates', () => ({
  useResponsesStates: () => ({ responses: state.responses }),
}))

vi.mock('@/features/responses/controllers/responsesControllers', () => ({
  useResponsesControllers: () => ({
    storeResponses: { mutate, isPending: false },
  }),
}))

const getField = (
  overrides: Partial<DataFormsDetailField> = {}
): DataFormsDetailField => ({
  id: 'field-1',
  label: 'Pertanyaan',
  description: '',
  placeholder: '',
  type: 'SHORT_TEXT',
  isRequired: false,
  options: [],
  order: 0,
  ...overrides,
})

const getDetail = (
  overrides: Partial<DataFormsDetail> = {}
): DataFormsDetail => ({
  id: 'form-1',
  title: 'Pesan Menu — Warung Blayer',
  description: 'Pilih makanan dan minumanmu.',
  purpose: '',
  isAiEnabled: false,
  templateId: 'restaurant',
  bannerUrl: '',
  meetingUrl: '',
  videoUrl: '',
  qrisUrl: '/qris-demo.svg',
  priceAmount: 0,
  isPublished: true,
  createdAt: '2026-08-18T00:00:00.000Z',
  fields: [
    getField({ id: 'meja', label: 'Nomor Meja', type: 'SELECT', options: ['Meja 01', 'Meja 02'] }),
    getField({
      id: 'menu',
      label: 'Pilih Menu',
      type: 'MENU',
      isRequired: true,
      options: [
        'Nasi Goreng Kampung|28000|/menu-nasi-goreng.svg',
        'Es Teh Manis|8000|/menu-es-teh.svg',
      ],
      order: 1,
    }),
    getField({
      id: 'bayar',
      label: 'Metode Pembayaran',
      type: 'PAYMENT',
      isRequired: true,
      options: ['QRIS|Pindai kode', 'Tunai|Bayar di kasir'],
      order: 2,
    }),
  ],
  ...overrides,
})

const loadSubmit = async () => {
  const { default: ResponsesSubmit } = await import(
    '@/features/responses/components/responsesSubmit'
  )
  return render(<ResponsesSubmit formId="form-1" />)
}

beforeEach(() => {
  mutate.mockClear()
  setGetFormsDetail.mockClear()
  state.formsDetail = {
    status: 'success',
    statusTitle: '',
    statusSubtitle: '',
    data: getDetail(),
  }
  state.responses = {
    status: 'empty',
    statusTitle: '',
    statusSubtitle: '',
    data: null,
  }
})

describe('identitas pengisi', () => {
  it('TC-21 form pesanan hanya menanyakan nama, tidak email', async () => {
    await loadSubmit()

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.queryByLabelText('Email Address')).not.toBeInTheDocument()
  })

  it('TC-21 penomoran pertanyaan menyambung dari identitas yang tampil', async () => {
    await loadSubmit()

    // Nama = 01, jadi pertanyaan pertama form mulai dari 02.
    expect(screen.getByText('02')).toBeInTheDocument()
  })

  it('TC-21 form acara tetap menanyakan email karena tiketnya dikirim ke sana', async () => {
    state.formsDetail.data = getDetail({
      templateId: 'event',
      fields: [getField({ id: 'sesi', label: 'Pilih Sesi' })],
    })
    await loadSubmit()

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
  })
})

describe('pengiriman jawaban', () => {
  it('TC-03 field wajib yang kosong menahan pengiriman', async () => {
    const user = userEvent.setup()
    await loadSubmit()

    await user.click(screen.getByRole('button', { name: /Submit/ }))

    expect(mutate).not.toHaveBeenCalled()
    expect(screen.getAllByText('This field is required.').length).toBe(2)
  })

  it('TC-15 metode pembayaran tersimpan bersama nominal tagihannya', async () => {
    const user = userEvent.setup()
    await loadSubmit()

    await user.click(
      screen.getAllByRole('button', { name: 'Tambah Nasi Goreng Kampung' })[0]
    )
    await user.click(screen.getByRole('button', { name: /QRIS/ }))
    await user.click(screen.getByRole('button', { name: /Submit/ }))

    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate.mock.calls[0][0]).toMatchObject({
      formId: 'form-1',
      answers: {
        menu: ['Nasi Goreng Kampung'],
        bayar: 'QRIS — Rp28.000',
      },
    })
  })

  it('TC-07 lama pengerjaan ikut terkirim bersama jawaban', async () => {
    const user = userEvent.setup()
    await loadSubmit()

    await user.click(
      screen.getAllByRole('button', { name: 'Tambah Es Teh Manis' })[0]
    )
    await user.click(screen.getByRole('button', { name: /Tunai/ }))
    await user.click(screen.getByRole('button', { name: /Submit/ }))

    expect(mutate.mock.calls[0][0].durationSeconds).toBeGreaterThanOrEqual(0)
  })

  it('TC-20 form berharga tetap menagih angka dari pembuat form', async () => {
    const user = userEvent.setup()
    state.formsDetail.data = getDetail({
      templateId: 'course',
      priceAmount: 350000,
      fields: [
        getField({
          id: 'bayar',
          label: 'Metode Pembayaran',
          type: 'PAYMENT',
          isRequired: true,
          options: ['QRIS|Pindai kode'],
        }),
      ],
    })
    await loadSubmit()

    expect(screen.getByText('Rp350.000')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /QRIS/ }))
    await user.click(screen.getByRole('button', { name: /Submit/ }))

    expect(mutate.mock.calls[0][0].answers.bayar).toBe('QRIS — Rp350.000')
  })
})

describe('keadaan halaman', () => {
  it('TC-30 memuat form memakai keterangan, bukan layar kosong', async () => {
    state.formsDetail = { ...state.formsDetail, status: 'loading', data: null }
    await loadSubmit()

    expect(screen.getByText('MEMUAT')).toBeInTheDocument()
    expect(screen.getByText('Menyiapkan Form')).toBeInTheDocument()
  })

  it('TC-03 form yang tidak ditemukan menawarkan percobaan ulang', async () => {
    const user = userEvent.setup()
    state.formsDetail = { ...state.formsDetail, status: 'error', data: null }
    await loadSubmit()

    await user.click(screen.getByRole('button', { name: 'Coba Lagi' }))

    expect(refetchFormsDetail).toHaveBeenCalled()
  })

  it('TC-05 halaman ujian ditandai terkunci lewat pencegah seleksi teks', async () => {
    state.formsDetail.data = getDetail({
      templateId: 'exam',
      fields: [getField({ id: 'soal', label: 'Soal 1' })],
    })
    const { container } = await loadSubmit()

    expect(container.querySelector('form')).toHaveClass('select-none')
  })
})
