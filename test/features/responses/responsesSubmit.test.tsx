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
  slug: 'form-satu',
  title: 'Meetup Frontend Jakarta',
  description: 'Ngobrol santai soal performa web.',
  templateId: 'event',
  image: '',
  meeting: '',
  isPublished: true,
  createdAt: '2026-08-18T00:00:00.000Z',
  fields: [
    getField({ id: 'instansi', label: 'Asal Instansi' }),
    getField({
      id: 'alasan',
      label: 'Alasan Ikut',
      isRequired: true,
      order: 1,
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
  it('TC-21 identitas ditanya sekali lewat kolom bawaan halaman isi', async () => {
    await loadSubmit()

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
  })

  it('TC-21 penomoran pertanyaan menyambung dari kolom identitas', async () => {
    await loadSubmit()

    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
  })
})

describe('pengiriman jawaban', () => {
  it('TC-03 field wajib yang kosong menahan pengiriman', async () => {
    const user = userEvent.setup()
    await loadSubmit()

    await user.click(screen.getByRole('button', { name: /Submit/ }))

    expect(mutate).not.toHaveBeenCalled()
    expect(screen.getAllByText('This field is required.').length).toBe(1)
  })

  it('TC-07 lama pengerjaan ikut terkirim bersama jawaban', async () => {
    const user = userEvent.setup()
    await loadSubmit()

    await user.type(screen.getByLabelText(/Alasan Ikut/), 'Belajar')
    await user.click(screen.getByRole('button', { name: /Submit/ }))

    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate.mock.calls[0][0]).toMatchObject({
      formId: 'form-1',
      answers: { alasan: 'Belajar' },
    })
    expect(mutate.mock.calls[0][0].duration).toBeGreaterThanOrEqual(0)
  })
})

describe('keadaan halaman', () => {
  it('TC-30 memuat form ditangani LoadData, bukan layar kosong', async () => {
    state.formsDetail = { ...state.formsDetail, status: 'loading', data: null }
    await loadSubmit()

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('TC-03 form yang tidak ditemukan menawarkan percobaan ulang', async () => {
    const user = userEvent.setup()
    state.formsDetail = { ...state.formsDetail, status: 'error', data: null }
    await loadSubmit()

    expect(screen.getByText('Form Not Found')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Coba Lagi' }))

    expect(refetchFormsDetail).toHaveBeenCalled()
  })
})
