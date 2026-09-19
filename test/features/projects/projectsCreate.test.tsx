import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import ProjectsList from '@/features/projects/components/projectsList'
import { useConsoleStates } from '@/features/console/states/consoleStates'
import { useProjectsStates } from '@/features/projects/states/projectsStates'

const fetchMock = vi.fn()

const getEnvelope = (status: number, payload: Record<string, unknown>) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  }) as Response

const renderList = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ProjectsList />
    </QueryClientProvider>
  )
}

const getSentBody = () => {
  const call = fetchMock.mock.calls.find(
    ([url, init]) =>
      url === '/api/v1/projects' && (init as RequestInit)?.method === 'POST'
  )

  return call ? JSON.parse((call[1] as RequestInit).body as string) : null
}

beforeEach(() => {
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(getEnvelope(200, { success: true, data: [] }))
  vi.stubGlobal('fetch', fetchMock)

  useConsoleStates.setState({
    token: 'blas_token',
    username: 'admin',
    isReady: true,
  })
  useProjectsStates.setState({
    projects: {
      status: 'empty',
      statusTitle: '',
      statusSubtitle: '',
      data: [],
    },
  })
})

describe('form project baru', () => {
  it('TC-83a menurunkan slug dari seluruh nama, bukan huruf pertamanya', async () => {
    renderList()

    await userEvent.type(screen.getByLabelText('Nama'), 'EasyAccounting')

    expect(screen.getByLabelText('Slug')).toHaveValue('easyaccounting')
  })

  it('TC-83b berhenti mengikuti nama setelah slug disunting sendiri', async () => {
    renderList()

    await userEvent.type(screen.getByLabelText('Nama'), 'Easy')
    await userEvent.clear(screen.getByLabelText('Slug'))
    await userEvent.type(screen.getByLabelText('Slug'), 'akuntansi')
    await userEvent.type(screen.getByLabelText('Nama'), ' Accounting')

    expect(screen.getByLabelText('Slug')).toHaveValue('akuntansi')
  })

  it('TC-83c mengirim slug yang utuh, bukan potongan satu huruf', async () => {
    renderList()

    await userEvent.type(screen.getByLabelText('Nama'), 'EasyAccounting')
    await userEvent.click(screen.getByRole('button', { name: /buat project/i }))

    await waitFor(() => expect(getSentBody()).not.toBeNull())
    expect(getSentBody()).toMatchObject({
      name: 'EasyAccounting',
      slug: 'easyaccounting',
    })
  })
})
