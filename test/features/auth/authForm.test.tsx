import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AuthForm from '@/features/auth/components/authForm'
import { useAuthStates } from '@/features/auth/states/authStates'

const router = { query: {} as Record<string, string>, replace: vi.fn() }

vi.mock('next/router', () => ({
  useRouter: () => router,
}))

const calls = {
  password: vi.fn(),
  register: vi.fn(),
  google: vi.fn(),
}

vi.mock('@/features/auth/services/authServices', () => ({
  getAuthSession: () => Promise.resolve(null),
  getAuthSessionChanges: () => () => {},
  postAuthSession: (payload: unknown) => {
    calls.google(payload)
    return Promise.resolve(null)
  },
  postAuthPassword: (payload: unknown) => {
    calls.password(payload)
    return Promise.resolve(null)
  },
  postAuthRegister: (payload: unknown) => {
    calls.register(payload)
    return Promise.resolve(null)
  },
  deleteAuthSession: vi.fn(),
}))

const renderForm = (mode: 'login' | 'register') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthForm mode={mode} />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  router.query = {}
  router.replace = vi.fn()
  calls.password = vi.fn()
  calls.register = vi.fn()
  calls.google = vi.fn()

  useAuthStates.setState({
    authSession: {
      status: 'empty',
      statusTitle: '',
      statusSubtitle: '',
      data: null,
    },
  })
})

describe('halaman masuk', () => {
  it('TC-26k menyediakan dua jalan masuk: username-kata sandi dan Google', () => {
    renderForm('login')

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Kata Sandi')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Lanjut dengan Google/ })
    ).toBeInTheDocument()
  })

  it('TC-26l mengirim username dan kata sandi yang diisi', async () => {
    const user = userEvent.setup()
    renderForm('login')

    await user.type(screen.getByLabelText(/username/i), 'blayeradmin')
    await user.type(screen.getByLabelText('Kata Sandi'), 'kataSandiPanjang')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    await waitFor(() => {
      expect(calls.password).toHaveBeenCalledWith({
        username: 'blayeradmin',
        password: 'kataSandiPanjang',
      })
    })
    expect(calls.register).not.toHaveBeenCalled()
  })

  it('TC-26m menahan kata sandi terlalu pendek sebelum menyentuh server', async () => {
    const user = userEvent.setup()
    renderForm('login')

    await user.type(screen.getByLabelText(/username/i), 'blayeradmin')
    await user.type(screen.getByLabelText('Kata Sandi'), 'pendek')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    expect(await screen.findByText(/minimal 8 karakter/i)).toBeInTheDocument()
    expect(calls.password).not.toHaveBeenCalled()
  })

  it('TC-26o masuk memakai alamat email dikirim apa adanya', async () => {
    const user = userEvent.setup()
    renderForm('login')

    await user.type(
      screen.getByLabelText(/username/i),
      'adminblayer@blayer.id'
    )
    await user.type(screen.getByLabelText('Kata Sandi'), 'kataSandiPanjang')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    await waitFor(() => {
      expect(calls.password).toHaveBeenCalledWith({
        username: 'adminblayer@blayer.id',
        password: 'kataSandiPanjang',
      })
    })
  })

  it('TC-26o alamat yang belum selesai diketik ditahan saat masuk', async () => {
    const user = userEvent.setup()
    renderForm('login')

    await user.type(screen.getByLabelText(/username/i), 'adminblayer@blayer')
    await user.type(screen.getByLabelText('Kata Sandi'), 'kataSandiPanjang')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    expect(await screen.findByText(/belum lengkap/i)).toBeInTheDocument()
    expect(calls.password).not.toHaveBeenCalled()
  })

  it('TC-26q tombol mata membuka dan menutup kata sandi', async () => {
    const user = userEvent.setup()
    renderForm('login')

    const field = screen.getByLabelText('Kata Sandi')
    await user.type(field, 'kataSandiPanjang')
    expect(field).toHaveAttribute('type', 'password')

    await user.click(
      screen.getByRole('button', { name: 'Tampilkan kata sandi' })
    )
    expect(field).toHaveAttribute('type', 'text')

    await user.click(
      screen.getByRole('button', { name: 'Sembunyikan kata sandi' })
    )
    expect(field).toHaveAttribute('type', 'password')

    // Tombolnya di dalam form, jadi harus dipastikan tidak ikut mengirim.
    expect(calls.password).not.toHaveBeenCalled()
  })

  it('TC-26n tombol Google membawa tujuan asal', async () => {
    const user = userEvent.setup()
    router.query = { next: '/forms/create' }
    renderForm('login')

    await user.click(screen.getByRole('button', { name: /Lanjut dengan Google/ }))

    await waitFor(() => {
      expect(calls.google).toHaveBeenCalledWith({ next: '/forms/create' })
    })
  })

  it('TC-26o tujuan ke domain luar tidak diikuti', async () => {
    const user = userEvent.setup()
    router.query = { next: 'https://situs-lain.example' }
    renderForm('login')

    await user.click(screen.getByRole('button', { name: /Lanjut dengan Google/ }))

    await waitFor(() => {
      expect(calls.google).toHaveBeenCalledWith({ next: '/forms' })
    })
  })
})

describe('halaman daftar', () => {
  it('TC-26p memakai jalur pendaftaran, bukan jalur masuk', async () => {
    const user = userEvent.setup()
    renderForm('register')

    await user.type(screen.getByLabelText(/username/i), 'penggunabaru')
    await user.type(screen.getByLabelText('Kata Sandi'), 'kataSandiPanjang')
    await user.click(screen.getByRole('button', { name: 'Daftar' }))

    await waitFor(() => {
      expect(calls.register).toHaveBeenCalledWith({
        username: 'penggunabaru',
        password: 'kataSandiPanjang',
      })
    })
    expect(calls.password).not.toHaveBeenCalled()
  })

  it('TC-26p mendaftar dengan email ditolak dan diberi tahu username-nya', async () => {
    const user = userEvent.setup()
    renderForm('register')

    // Saat mendaftar, alamatnya dibentuk dari username. Membiarkan isian berupa
    // email lolos akan membuat akun beralamat ganda yang tidak bisa dimasuki.
    await user.type(
      screen.getByLabelText(/username/i),
      'penggunabaru@blayer.id'
    )
    await user.type(screen.getByLabelText('Kata Sandi'), 'kataSandiPanjang')
    await user.click(screen.getByRole('button', { name: 'Daftar' }))

    expect(await screen.findByText(/tanpa @blayer\.id/i)).toBeInTheDocument()
    expect(screen.queryByText(/huruf, angka/i)).not.toBeInTheDocument()
    expect(calls.register).not.toHaveBeenCalled()
  })

  it('TC-26p tetap menawarkan Google dan jalan ke halaman masuk', () => {
    renderForm('register')

    expect(
      screen.getByRole('button', { name: /Daftar dengan Google/ })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute(
      'href',
      '/login'
    )
  })
})
