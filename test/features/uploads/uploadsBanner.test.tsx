import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mutate = vi.fn()

const state = {
  uploadsBanner: {
    status: 'empty',
    statusTitle: '',
    statusSubtitle: '',
    data: null,
  },
}

vi.mock('@/features/uploads/states/uploadsStates', () => ({
  useUploadsStates: () => state,
}))

vi.mock('@/features/uploads/controllers/uploadsControllers', () => ({
  useUploadsControllers: () => ({
    storeUploadsBanner: { mutate, isPending: false },
  }),
}))

const loadBanner = async (
  props: { value?: string; alt?: string; emptyLabel?: string } = {}
) => {
  const { default: UploadsBanner } = await import(
    '@/features/uploads/components/uploadsBanner'
  )
  return render(
    <UploadsBanner value="" onEditBanner={vi.fn()} {...props} />
  )
}

const getFile = (name: string, type: string, size: number) => {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

beforeEach(() => {
  mutate.mockClear()
  state.uploadsBanner = {
    status: 'empty',
    statusTitle: '',
    statusSubtitle: '',
    data: null,
  }
})

describe('unggah gambar', () => {
  it('TC-10 keadaan kosong menyebut format dan batas ukurannya', async () => {
    await loadBanner()

    expect(screen.getByText('UNGGAH BANNER')).toBeInTheDocument()
    expect(
      screen.getByText('JPG, PNG, WEBP, GIF, atau AVIF. Maksimal 4 MB.')
    ).toBeInTheDocument()
  })

  it('TC-16 label bisa diganti untuk unggahan selain banner', async () => {
    await loadBanner({ emptyLabel: 'UNGGAH QRIS' })

    expect(screen.getByText('UNGGAH QRIS')).toBeInTheDocument()
  })

  it('TC-10 berkas bukan gambar ditolak sebelum dikirim ke server', async () => {
    const { container } = await loadBanner()
    const input = container.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, {
      target: { files: [getFile('catatan.txt', 'text/plain', 1024)] },
    })

    expect(mutate).not.toHaveBeenCalled()
    expect(screen.getByText('Berkas harus gambar.')).toBeInTheDocument()
  })

  it('TC-10 gambar di atas 4 MB ditolak sebelum dikirim ke server', async () => {
    const user = userEvent.setup()
    const { container } = await loadBanner()
    const input = container.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(
      input,
      getFile('banner.png', 'image/png', 5 * 1024 * 1024)
    )

    expect(mutate).not.toHaveBeenCalled()
    expect(screen.getByText('Ukuran gambar maksimal 4 MB.')).toBeInTheDocument()
  })

  it('TC-10 gambar yang sudah terunggah tampil sebagai pratinjau', async () => {
    await loadBanner({ value: '/menu-nasi-goreng.svg', alt: 'Pratinjau banner form' })

    expect(screen.getByAltText('Pratinjau banner form')).toHaveAttribute(
      'src',
      '/menu-nasi-goreng.svg'
    )
    expect(screen.getByRole('button', { name: /Hapus/ })).toBeInTheDocument()
  })

  it('TC-10 kegagalan dari server disampaikan apa adanya ke pengguna', async () => {
    state.uploadsBanner = {
      status: 'error',
      statusTitle: 'Gagal',
      statusSubtitle: 'Bucket "banner" belum ada.',
      data: null,
    }
    await loadBanner()

    expect(screen.getByText('Bucket "banner" belum ada.')).toBeInTheDocument()
  })
})
