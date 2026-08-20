import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DataForms } from '@/features/forms/types/formsTypes'

const push = vi.fn()
const refetch = vi.fn()
const destroyMutate = vi.fn()

vi.mock('next/router', () => ({
  useRouter: () => ({ push, query: {}, isReady: true }),
}))

const state = {
  forms: {
    status: 'success',
    statusTitle: '',
    statusSubtitle: '',
    data: [] as DataForms[],
  },
}

vi.mock('@/features/forms/states/formsStates', () => ({
  useFormsStates: () => state,
}))

vi.mock('@/features/forms/controllers/formsControllers', () => ({
  useFormsControllers: () => ({
    fetchForms: { refetch },
    destroyForms: { mutate: destroyMutate },
  }),
}))

const getForm = (overrides: Partial<DataForms> = {}): DataForms => ({
  id: 'form-1',
  title: 'Ujian Sejarah',
  description: '',
  purpose: '',
  isAiEnabled: false,
  templateId: 'exam',
  isPublished: true,
  totalField: 6,
  totalResponse: 5,
  createdAt: '2026-08-18T00:00:00.000Z',
  ...overrides,
})

const loadList = async () => {
  const { default: FormsList } = await import(
    '@/features/forms/components/formsList'
  )
  return render(<FormsList />)
}

beforeEach(() => {
  push.mockClear()
  refetch.mockClear()
  destroyMutate.mockClear()
  state.forms = {
    status: 'success',
    statusTitle: '',
    statusSubtitle: '',
    data: [
      getForm(),
      getForm({ id: 'form-2', title: 'Pesan Menu', templateId: 'restaurant' }),
      getForm({ id: 'form-3', title: 'Kelas Web', templateId: 'course' }),
    ],
  }
})

describe('riwayat form', () => {
  it('TC-13 semua form tampil sebelum filter dipakai', async () => {
    await loadList()

    expect(screen.getByRole('heading', { name: 'Ujian Sejarah' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pesan Menu' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Kelas Web' })).toBeInTheDocument()
  })

  it('TC-13 tombol See menyaring riwayat ke template itu saja', async () => {
    const user = userEvent.setup()
    await loadList()

    const restaurantCard = screen
      .getByRole('heading', { name: 'Menu Restoran' })
      .closest('div')?.parentElement as HTMLElement

    await user.click(within(restaurantCard).getByRole('button', { name: /See/ }))

    expect(screen.getByRole('heading', { name: 'Pesan Menu' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Ujian Sejarah' })
    ).not.toBeInTheDocument()
    expect(screen.getByText(/FILTER TEMPLATE — Menu Restoran/)).toBeInTheDocument()
  })

  it('TC-13 klik See sekali lagi melepas filternya', async () => {
    const user = userEvent.setup()
    await loadList()

    const restaurantCard = screen
      .getByRole('heading', { name: 'Menu Restoran' })
      .closest('div')?.parentElement as HTMLElement
    const seeButton = within(restaurantCard).getByRole('button', { name: /See/ })

    await user.click(seeButton)
    await user.click(
      within(restaurantCard).getByRole('button', { name: /Shown/ })
    )

    expect(screen.getByRole('heading', { name: 'Ujian Sejarah' })).toBeInTheDocument()
    expect(screen.queryByText(/FILTER TEMPLATE/)).not.toBeInTheDocument()
  })

  it('TC-13 tombol Hapus Filter mengembalikan seluruh riwayat', async () => {
    const user = userEvent.setup()
    await loadList()

    const restaurantCard = screen
      .getByRole('heading', { name: 'Menu Restoran' })
      .closest('div')?.parentElement as HTMLElement

    await user.click(within(restaurantCard).getByRole('button', { name: /See/ }))
    await user.click(screen.getByRole('button', { name: /Hapus Filter/ }))

    expect(screen.getByRole('heading', { name: 'Ujian Sejarah' })).toBeInTheDocument()
  })

  it('TC-13 template tanpa form memberi tahu cara membuat yang pertama', async () => {
    const user = userEvent.setup()
    state.forms.data = [getForm()]
    await loadList()

    const courseCard = screen
      .getByRole('heading', { name: 'Kursus Kelas' })
      .closest('div')?.parentElement as HTMLElement

    await user.click(within(courseCard).getByRole('button', { name: /See/ }))

    expect(
      screen.getByText(/Belum ada form yang dibuat dari template Kursus Kelas/)
    ).toBeInTheDocument()
  })

  it('TC-01 tombol Use meneruskan template ke builder lewat query string', async () => {
    const user = userEvent.setup()
    await loadList()

    const examCard = screen
      .getByRole('heading', { name: 'Ujian Sekolah' })
      .closest('div')?.parentElement as HTMLElement

    await user.click(within(examCard).getByRole('button', { name: 'Use' }))

    expect(push).toHaveBeenCalledWith('/forms/create?template=exam')
  })

  it('TC-30 keadaan memuat ditangani LoadData, bukan daftar kosong', async () => {
    state.forms = { ...state.forms, status: 'loading', data: [] }
    await loadList()

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Ujian Sejarah' })
    ).not.toBeInTheDocument()
  })

  it('TC-03 kegagalan memuat menawarkan percobaan ulang', async () => {
    const user = userEvent.setup()
    state.forms = {
      status: 'error',
      statusTitle: 'Something went wrong',
      statusSubtitle: 'Please try again later.',
      data: [],
    }
    await loadList()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(refetch).toHaveBeenCalled()
  })

  it('TC-13 pencarian menyaring berdasarkan judul form', async () => {
    const user = userEvent.setup()
    await loadList()

    await user.type(screen.getByLabelText('Cari form'), 'kelas')

    expect(screen.getByRole('heading', { name: 'Kelas Web' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Ujian Sejarah' })
    ).not.toBeInTheDocument()
  })
})

describe('riwayat form yang belum berisi', () => {
  it('TC-01 mengarahkan pengguna membuat form pertamanya', async () => {
    state.forms = { ...state.forms, status: 'success', data: [] }
    await loadList()

    expect(screen.getByText('No Forms Yet')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Create Form/ })
    ).toHaveAttribute('href', '/forms/create')
  })
})

describe('menghapus form dari riwayat', () => {
  it('TC-39g menghapus setelah konfirmasi disetujui', async () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => true)

    await loadList()
    await userEvent.click(
      screen.getAllByRole('button', { name: /Hapus form/i })[0]
    )

    expect(destroyMutate).toHaveBeenCalledWith(
      { id: 'form-1' },
      expect.anything()
    )
    confirmSpy.mockRestore()
  })

  it('TC-39h tidak menghapus apa pun kalau konfirmasi dibatalkan', async () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => false)

    await loadList()
    await userEvent.click(
      screen.getAllByRole('button', { name: /Hapus form/i })[0]
    )

    expect(destroyMutate).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('TC-39i menyebut jumlah jawaban yang ikut terhapus di konfirmasi', async () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => false)

    await loadList()
    await userEvent.click(
      screen.getAllByRole('button', { name: /Hapus form/i })[0]
    )

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('5 jawaban')
    )
    confirmSpy.mockRestore()
  })

  it('TC-39j menyediakan jalan menyunting tiap form', async () => {
    await loadList()

    expect(
      screen.getAllByRole('link', { name: /Sunting form/i })[0]
    ).toHaveAttribute('href', '/forms/form-1/edit')
  })
})
describe('jelajah kategori dari kartu template', () => {
  it('TC-13g Explore membuka katalog kategori template itu', async () => {
    const user = userEvent.setup()
    await loadList()

    const explore = screen.getAllByRole('button', { name: /Explore/ })[0]
    await user.click(explore)

    expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/kategori\//))
  })
})
