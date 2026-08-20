import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ResponsesSubmit from '@/features/responses/components/responsesSubmit'
import { useFormsStates } from '@/features/forms/states/formsStates'

vi.mock('next/router', () => ({
  useRouter: () => ({ query: {}, push: vi.fn(), isReady: true }),
}))

vi.mock('@/features/forms/controllers/formsControllers', () => ({
  useFormsControllers: () => ({ fetchFormsDetail: { refetch: vi.fn() } }),
}))

vi.mock('@/features/responses/controllers/responsesControllers', () => ({
  useResponsesControllers: () => ({
    storeResponses: { mutate: vi.fn(), isPending: false, error: null },
  }),
}))

const setForm = (isAiEnabled: boolean) => {
  useFormsStates.setState({
    formsDetail: {
      status: 'success',
      statusTitle: '',
      statusSubtitle: '',
      data: {
        id: 'form-1',
        title: 'Form Satu',
        description: '',
        isAiEnabled,
        templateId: 'exam',
        bannerUrl: '',
        qrisUrl: '',
        priceAmount: 0,
        isPublished: true,
        createdAt: '2026-08-01T00:00:00.000Z',
        purpose: '',
        meetingUrl: '',
        videoUrl: '',
        fields: [
          {
            id: 'field-1',
            label: 'Nama',
            description: '',
            placeholder: '',
            type: 'SHORT_TEXT',
            isRequired: false,
            options: [],
            order: 0,
          },
        ],
      },
    } as never,
  })
}

beforeEach(() => {
  setForm(false)
})

describe('pengungkapan pemrosesan AI', () => {
  it('TC-47a responden diberi tahu sebelum mengirim, bukan sesudah', () => {
    setForm(true)
    render(<ResponsesSubmit formId="form-1" />)

    const notice = screen.getByText(/dianalisis dengan bantuan AI/i)
    expect(notice).toBeInTheDocument()
    expect(notice).toHaveTextContent(/Anthropic/)

    // Pengungkapan tanpa jalan ke kebijakannya hanya setengah pemberitahuan.
    expect(screen.getByRole('link', { name: /Kebijakan privasi/i })).toHaveAttribute(
      'href',
      '/privacy'
    )
  })

  it('TC-47a form tanpa AI tidak memberi pemberitahuan yang tidak berlaku', () => {
    setForm(false)
    render(<ResponsesSubmit formId="form-1" />)

    expect(screen.queryByText(/dianalisis dengan bantuan AI/i)).not.toBeInTheDocument()
  })
})
