import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ConsoleGate from '@/features/console/components/consoleGate'
import { useConsoleStates } from '@/features/console/states/consoleStates'

beforeEach(() => {
  window.localStorage.clear()
  useConsoleStates.setState({ token: '', isReady: false })
})

describe('gerbang token console', () => {
  it('TC-68a menahan isi console sampai tokennya diisi', async () => {
    render(
      <ConsoleGate>
        <p>daftar project</p>
      </ConsoleGate>
    )

    expect(await screen.findByLabelText('Token')).toBeInTheDocument()
    expect(screen.queryByText('daftar project')).not.toBeInTheDocument()
  })

  it('TC-68b membuka console setelah token disimpan di browser ini', async () => {
    render(
      <ConsoleGate>
        <p>daftar project</p>
      </ConsoleGate>
    )

    await userEvent.type(await screen.findByLabelText('Token'), 'token-uji')
    await userEvent.click(screen.getByRole('button', { name: /masuk console/i }))

    expect(await screen.findByText('daftar project')).toBeInTheDocument()
    expect(window.localStorage.getItem('blayer.console.token')).toBe('token-uji')
  })

  it('TC-68c memakai token yang sudah tersimpan tanpa bertanya lagi', async () => {
    window.localStorage.setItem('blayer.console.token', 'token-tersimpan')

    render(
      <ConsoleGate>
        <p>daftar project</p>
      </ConsoleGate>
    )

    expect(await screen.findByText('daftar project')).toBeInTheDocument()
  })

  it('TC-68d melupakan token atas permintaan operator', async () => {
    window.localStorage.setItem('blayer.console.token', 'token-tersimpan')

    render(
      <ConsoleGate>
        <p>daftar project</p>
      </ConsoleGate>
    )

    await userEvent.click(
      await screen.findByRole('button', { name: /lupakan token/i })
    )

    expect(window.localStorage.getItem('blayer.console.token')).toBeNull()
    expect(await screen.findByLabelText('Token')).toBeInTheDocument()
  })
})
