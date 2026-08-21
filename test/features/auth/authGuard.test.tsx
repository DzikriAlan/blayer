import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AuthGuard from '@/features/auth/components/authGuard'
import { useAuthStates } from '@/features/auth/states/authStates'

const router = {
  pathname: '/forms/create',
  asPath: '/forms/create',
  replace: vi.fn(),
}

vi.mock('next/router', () => ({
  useRouter: () => router,
}))

const session = { data: null as unknown }

vi.mock('@/features/auth/services/authServices', () => ({
  getAuthSession: () => Promise.resolve(session.data),
  postAuthSession: vi.fn(),
  deleteAuthSession: vi.fn(),
  getAuthSessionChanges: () => () => {},
}))

const renderGuard = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <p>isi halaman terkunci</p>
      </AuthGuard>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  router.pathname = '/forms/create'
  router.asPath = '/forms/create'
  router.replace = vi.fn()
  session.data = null

  // Zustand hidup di luar React, jadi sisa sesi dari test sebelumnya harus
  // dibersihkan sendiri agar tiap kasus mulai dari keadaan belum tahu.
  useAuthStates.setState({
    authSession: {
      status: 'loading',
      statusTitle: '',
      statusSubtitle: '',
      data: null,
    },
  })
})

describe('guard halaman', () => {
  it('TC-26a menahan halaman terkunci dan melempar ke login dengan tujuan asal', async () => {
    renderGuard()

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith(
        '/login?next=%2Fforms%2Fcreate'
      )
    })
    expect(screen.queryByText('isi halaman terkunci')).not.toBeInTheDocument()
  })

  it('TC-26b tidak pernah membocorkan isi halaman selama sesi belum pasti', () => {
    renderGuard()

    expect(screen.queryByText('isi halaman terkunci')).not.toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('TC-26c meloloskan pengguna yang sudah punya sesi', async () => {
    session.data = {
      id: 'user-1',
      email: 'pemilik@blayer.test',
      name: 'Pemilik',
      avatarUrl: '',
    }

    renderGuard()

    expect(await screen.findByText('isi halaman terkunci')).toBeInTheDocument()
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('TC-26d membiarkan halaman isi form terbuka tanpa login', async () => {
    router.pathname = '/forms/[id]'
    router.asPath = '/forms/abc123'

    renderGuard()

    expect(await screen.findByText('isi halaman terkunci')).toBeInTheDocument()
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('TC-26e membiarkan halaman depan terbuka tanpa login', async () => {
    router.pathname = '/'
    router.asPath = '/'

    renderGuard()

    expect(await screen.findByText('isi halaman terkunci')).toBeInTheDocument()
    expect(router.replace).not.toHaveBeenCalled()
  })
})

describe('rute yang harus terbuka tanpa sesi', () => {
  it.each([
    ['/auth/forgot-password', 'orang yang lupa sandi tidak bisa masuk dulu'],
    ['/auth/reset-password', 'tautan dari surat dibuka sebelum ada sesi'],
    ['/privacy', 'responden tanpa akun perlu membacanya'],
  ])('TC-54 %s terbuka — %s', async (pathname) => {
    session.data = null
    router.pathname = pathname
    router.asPath = pathname
    router.replace = vi.fn()

    renderGuard()

    expect(await screen.findByText('isi halaman terkunci')).toBeInTheDocument()
    await waitFor(() => expect(router.replace).not.toHaveBeenCalled())
  })
})
