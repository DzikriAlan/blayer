import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PageShell from '@/components/page-shell'

const router = { back: vi.fn(), push: vi.fn(), asPath: '/forms/abc' }

vi.mock('next/router', () => ({
  useRouter: () => router,
}))

vi.mock('@/features/auth/components/authAccount', () => ({
  default: () => null,
}))

const setHistoryLength = (length: number) => {
  Object.defineProperty(window.history, 'length', {
    configurable: true,
    value: length,
  })
}

const renderShell = (backHref?: string) =>
  render(
    <PageShell barTitle="RESPONDING" backHref={backHref}>
      <p>isi halaman</p>
    </PageShell>
  )

beforeEach(() => {
  router.back = vi.fn()
  router.push = vi.fn()
  setHistoryLength(2)
})

describe('rangka halaman dengan bilah', () => {
  it('TC-34a menyediakan jalan kembali ke halaman sebelumnya', async () => {
    const user = userEvent.setup()
    renderShell('/forms')

    const back = screen.getByRole('link', {
      name: 'Kembali ke halaman sebelumnya',
    })
    await user.click(back)

    expect(router.back).toHaveBeenCalled()
  })

  it('TC-34a tautan form yang dibuka langsung tetap punya tujuan', async () => {
    const user = userEvent.setup()
    setHistoryLength(1)
    renderShell('/forms')

    const back = screen.getByRole('link', {
      name: 'Kembali ke halaman sebelumnya',
    })

    expect(back).toHaveAttribute('href', '/forms')

    await user.click(back)

    expect(router.back).not.toHaveBeenCalled()
  })

  it('TC-34a tanpa tujuan yang disebut, kembalinya ke halaman depan', () => {
    renderShell()

    expect(
      screen.getByRole('link', { name: 'Kembali ke halaman sebelumnya' })
    ).toHaveAttribute('href', '/')
  })
})
