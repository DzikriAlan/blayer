import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import ConsoleShell from '@/components/console-shell'
import ConsoleGate from '@/features/console/components/consoleGate'
import { useConsoleStates } from '@/features/console/states/consoleStates'

const fetchMock = vi.fn()

const SESSION = {
  token: 'blas_token-uji',
  username: 'admin',
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
}

const getEnvelope = (status: number, payload: Record<string, unknown>) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  }) as Response

const renderGate = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ConsoleShell breadcrumb={[{ label: 'Semua project' }]}>
        <ConsoleGate>
          <p>daftar project</p>
        </ConsoleGate>
      </ConsoleShell>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  window.localStorage.clear()
  useConsoleStates.setState({
    token: '',
    username: '',
    isReady: false,
    isDefaultCredentials: false,
  })

  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

describe('gerbang console', () => {
  it('TC-68a menahan isi console sampai operatornya masuk', async () => {
    renderGate()

    expect(await screen.findByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Kata sandi')).toBeInTheDocument()
    expect(screen.queryByText('daftar project')).not.toBeInTheDocument()
  })

  it('TC-68b membuka console setelah username dan kata sandinya diterima', async () => {
    fetchMock.mockResolvedValue(
      getEnvelope(200, {
        success: true,
        data: { ...SESSION, isDefaultCredentials: false },
      })
    )

    renderGate()

    await userEvent.type(await screen.findByLabelText('Username'), 'admin')
    await userEvent.type(screen.getByLabelText('Kata sandi'), 'admin123')
    await userEvent.click(screen.getByRole('button', { name: /^masuk$/i }))

    expect(await screen.findByText('daftar project')).toBeInTheDocument()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/auth/login')
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      username: 'admin',
      password: 'admin123',
    })
    expect((init as RequestInit).headers).not.toHaveProperty('Authorization')
  })

  it('TC-68c menahan operator di halaman masuk saat kredensialnya salah', async () => {
    fetchMock.mockResolvedValue(
      getEnvelope(401, {
        success: false,
        message: 'Username atau kata sandi salah.',
        errors: [{ code: 'INVALID_CREDENTIALS', message: 'Username atau kata sandi salah.' }],
      })
    )

    renderGate()

    await userEvent.type(await screen.findByLabelText('Username'), 'admin')
    await userEvent.type(screen.getByLabelText('Kata sandi'), 'salah')
    await userEvent.click(screen.getByRole('button', { name: /^masuk$/i }))

    expect(
      await screen.findByText('Username atau kata sandi salah.')
    ).toBeInTheDocument()
    expect(screen.queryByText('daftar project')).not.toBeInTheDocument()
  })

  it('TC-68d memakai sesi yang masih berlaku tanpa meminta masuk lagi', async () => {
    window.localStorage.setItem('blayer.console.session', JSON.stringify(SESSION))

    renderGate()

    expect(await screen.findByText('daftar project')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('TC-68e meminta masuk lagi begitu sesinya kedaluwarsa', async () => {
    window.localStorage.setItem(
      'blayer.console.session',
      JSON.stringify({
        ...SESSION,
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
      })
    )

    renderGate()

    expect(await screen.findByLabelText('Username')).toBeInTheDocument()
  })

  it('TC-68f mengeluarkan operator atas permintaannya', async () => {
    window.localStorage.setItem('blayer.console.session', JSON.stringify(SESSION))

    renderGate()

    await userEvent.click(await screen.findByRole('button', { name: /keluar/i }))

    await waitFor(() =>
      expect(window.localStorage.getItem('blayer.console.session')).toBeNull()
    )
    expect(await screen.findByLabelText('Username')).toBeInTheDocument()
  })

  it('TC-68g memperingatkan selama kredensialnya masih bawaan', async () => {
    fetchMock.mockResolvedValue(
      getEnvelope(200, {
        success: true,
        data: { ...SESSION, isDefaultCredentials: true },
      })
    )

    renderGate()

    await userEvent.type(await screen.findByLabelText('Username'), 'admin')
    await userEvent.type(screen.getByLabelText('Kata sandi'), 'admin123')
    await userEvent.click(screen.getByRole('button', { name: /^masuk$/i }))

    expect(
      await screen.findByText(/Kredensial masih bawaan/)
    ).toBeInTheDocument()
  })
})
