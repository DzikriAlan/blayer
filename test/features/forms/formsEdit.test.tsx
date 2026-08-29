import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DataFormsDetail } from '@/features/forms/types/formsTypes'

const push = vi.fn()
const mutate = vi.fn()
const updateMutate = vi.fn()
const setGetFormsDetail = vi.fn()

const router = {
  pathname: '/forms/[id]/edit',
  query: { id: 'form-1' } as Record<string, string>,
  isReady: true,
  push,
  replace: vi.fn(),
}

vi.mock('next/router', () => ({ useRouter: () => router }))

const getDetail = (): DataFormsDetail => ({
  id: 'form-1',
  slug: 'form-satu',
  title: 'Ujian Sejarah',
  description: 'Kerjakan sendiri',
  templateId: 'exam',
  image: '',
  meeting: '',
  qrisImage: '',
  price: 0,
  isPublished: true,
  createdAt: '2026-08-01T00:00:00.000Z',
  fields: [
    {
      id: 'field-1',
      label: 'Sebutkan tahun proklamasi',
      description: '',
      placeholder: '',
      type: 'SHORT_TEXT',
      isRequired: true,
      options: [],
      order: 0,
    },
  ],
})

const state = {
  formsCreated: {
    status: 'empty',
    statusTitle: '',
    statusSubtitle: '',
    data: null,
  },
  formsDetail: {
    status: 'success',
    statusTitle: '',
    statusSubtitle: '',
    data: getDetail() as DataFormsDetail | null,
  },
  setGetFormsDetail,
}

vi.mock('@/features/forms/states/formsStates', () => ({
  useFormsStates: () => state,
}))

vi.mock('@/features/forms/controllers/formsControllers', () => ({
  useFormsControllers: () => ({
    storeForms: { mutate, isPending: false },
    updateForms: { mutate: updateMutate, isPending: false },
  }),
}))

vi.mock('@/features/uploads/states/uploadsStates', () => ({
  useUploadsStates: () => ({
    uploadsBanner: {
      status: 'empty',
      statusTitle: '',
      statusSubtitle: '',
      data: null,
    },
  }),
}))

vi.mock('@/features/uploads/controllers/uploadsControllers', () => ({
  useUploadsControllers: () => ({
    storeUploadsBanner: { mutate: vi.fn(), isPending: false },
  }),
}))

const loadEdit = async () => {
  const { default: FormsCreate } = await import(
    '@/features/forms/components/formsCreate'
  )
  return render(<FormsCreate formId="form-1" />)
}

beforeEach(() => {
  push.mockClear()
  mutate.mockClear()
  updateMutate.mockClear()
  setGetFormsDetail.mockClear()
  state.formsDetail.data = getDetail()
})

describe('menyunting form yang sudah ada', () => {
  it('TC-39k memuat isian form tersimpan ke builder', async () => {
    await loadEdit()

    await waitFor(() => {
      expect(screen.getByLabelText('Form Title')).toHaveValue('Ujian Sejarah')
    })
    expect(
      screen.getByDisplayValue('Sebutkan tahun proklamasi')
    ).toBeInTheDocument()
  })

  it('TC-39l menyimpan lewat updateForms, bukan membuat form baru', async () => {
    const user = userEvent.setup()
    await loadEdit()

    await waitFor(() => {
      expect(screen.getByLabelText('Form Title')).toHaveValue('Ujian Sejarah')
    })

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(updateMutate).toHaveBeenCalled())
    expect(mutate).not.toHaveBeenCalled()
    expect(updateMutate.mock.calls[0][0]).toMatchObject({ id: 'form-1' })
  })

  it('TC-39m mempertahankan id field lama supaya jawaban lama tetap punya pertanyaan', async () => {
    const user = userEvent.setup()
    await loadEdit()

    await waitFor(() => {
      expect(screen.getByLabelText('Form Title')).toHaveValue('Ujian Sejarah')
    })

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(updateMutate).toHaveBeenCalled())
    expect(updateMutate.mock.calls[0][0].fields[0].id).toBe('field-1')
  })
})
