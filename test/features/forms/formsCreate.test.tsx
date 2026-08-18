import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()
const mutate = vi.fn()

vi.mock('next/router', () => ({
  useRouter: () => ({ push, query: {}, isReady: true }),
}))

const state = {
  formsCreated: {
    status: 'empty',
    statusTitle: '',
    statusSubtitle: '',
    data: null,
  },
}

vi.mock('@/features/forms/states/formsStates', () => ({
  useFormsStates: () => state,
}))

vi.mock('@/features/forms/controllers/formsControllers', () => ({
  useFormsControllers: () => ({
    storeForms: { mutate, isPending: false },
  }),
}))

vi.mock('@/features/uploads/states/uploadsStates', () => ({
  useUploadsStates: () => ({
    uploadsBanner: { status: 'empty', statusTitle: '', statusSubtitle: '', data: null },
  }),
}))

vi.mock('@/features/uploads/controllers/uploadsControllers', () => ({
  useUploadsControllers: () => ({
    storeUploadsBanner: { mutate: vi.fn(), isPending: false },
  }),
}))

const loadCreate = async (onEditFormsTitle?: (title: string) => void) => {
  const { default: FormsCreate } = await import(
    '@/features/forms/components/formsCreate'
  )
  return render(<FormsCreate onEditFormsTitle={onEditFormsTitle} />)
}

beforeEach(() => {
  push.mockClear()
  mutate.mockClear()
})

describe('judul form di builder', () => {
  it('TC-34 judul yang diketik diteruskan ke halaman induk', async () => {
    const onEditFormsTitle = vi.fn()
    const user = userEvent.setup()
    await loadCreate(onEditFormsTitle)

    await user.type(screen.getByLabelText('Form Title'), 'Ujian Sejarah')

    await waitFor(() => {
      expect(onEditFormsTitle).toHaveBeenLastCalledWith('Ujian Sejarah')
    })
  })

  it('TC-34 judul kosong dilaporkan apa adanya, bukan ditahan', async () => {
    const onEditFormsTitle = vi.fn()
    await loadCreate(onEditFormsTitle)

    await waitFor(() => {
      expect(onEditFormsTitle).toHaveBeenCalledWith('')
    })
  })

  it('TC-34 memakai template ikut memperbarui judulnya', async () => {
    const onEditFormsTitle = vi.fn()
    const user = userEvent.setup()
    await loadCreate(onEditFormsTitle)

    const examCard = screen
      .getByRole('heading', { name: 'Ujian Sekolah' })
      .closest('div')?.parentElement as HTMLElement

    await user.click(within(examCard).getByRole('button', { name: 'Use' }))

    await waitFor(() => {
      expect(onEditFormsTitle).toHaveBeenLastCalledWith(
        'Ujian Tengah Semester — Sejarah Kelas XI'
      )
    })
  })

  it('TC-01 builder tidak menampilkan tombol See karena tidak punya riwayat', async () => {
    await loadCreate()

    expect(screen.queryByRole('button', { name: /See/ })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Use' }).length).toBeGreaterThan(0)
  })
})