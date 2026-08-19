import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()
const mutate = vi.fn()

// Router tiruan menyimpan query-nya sendiri supaya sinkronisasi ?template=
// benar-benar teruji: replace harus mengubah nilai yang dibaca efeknya.
const router = {
  pathname: '/forms/create',
  query: {} as Record<string, string>,
  isReady: true,
  push,
  replace: vi.fn((url: { query: Record<string, string> }) => {
    router.query = { ...url.query }
    return Promise.resolve(true)
  }),
}

vi.mock('next/router', () => ({
  useRouter: () => router,
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

const getTemplateCard = (name: string) =>
  screen.getByRole('heading', { name }).closest('div')?.parentElement as HTMLElement

beforeEach(() => {
  push.mockClear()
  mutate.mockClear()
  router.replace.mockClear()
  router.query = {}
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

    await user.click(
      within(getTemplateCard('Ujian Sekolah')).getByRole('button', {
        name: 'Use',
      })
    )

    await waitFor(() => {
      expect(onEditFormsTitle).toHaveBeenLastCalledWith(
        'Ujian Tengah Semester — Sejarah Kelas XI'
      )
    })
  })

  it('TC-35 template lain tetap bisa dipilih setelah datang lewat ?template=', async () => {
    const user = userEvent.setup()
    router.query = { template: 'exam' }
    await loadCreate()

    await waitFor(() => {
      expect(screen.getByLabelText('Form Title')).toHaveValue(
        'Ujian Tengah Semester — Sejarah Kelas XI'
      )
    })

    await user.click(
      within(getTemplateCard('Menu Restoran')).getByRole('button', {
        name: 'Use',
      })
    )

    // Isian berpindah ke template baru dan tidak ditarik kembali ke yang lama.
    await waitFor(() => {
      expect(screen.getByLabelText('Form Title')).toHaveValue(
        'Pesan Menu — Meja Restoran'
      )
    })
  })

  it('TC-35 memilih template memperbarui query di URL', async () => {
    const user = userEvent.setup()
    router.query = { template: 'exam' }
    await loadCreate()

    await user.click(
      within(getTemplateCard('Kursus Kelas')).getByRole('button', {
        name: 'Use',
      })
    )

    expect(router.replace).toHaveBeenCalledWith(
      { pathname: '/forms/create', query: { template: 'course' } },
      undefined,
      { shallow: true }
    )
    expect(router.query.template).toBe('course')
  })

  it('TC-01 builder tidak menampilkan tombol See karena tidak punya riwayat', async () => {
    await loadCreate()

    expect(screen.queryByRole('button', { name: /See/ })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Use' }).length).toBeGreaterThan(0)
  })
})