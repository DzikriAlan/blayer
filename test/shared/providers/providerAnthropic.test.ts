import { beforeEach, describe, expect, it, vi } from 'vitest'

import { runAnthropic } from '@/shared/lib/providers/providerAnthropic'
import { ProviderError } from '@/shared/lib/providers/providerTypes'

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))

vi.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error {
    status?: number

    constructor(message = 'gagal', status?: number) {
      super(message)
      this.status = status
    }
  }

  class AuthenticationError extends APIError {}
  class RateLimitError extends APIError {}

  class Anthropic {
    static APIError = APIError
    static AuthenticationError = AuthenticationError
    static RateLimitError = RateLimitError

    messages = { create: createMock }
  }

  return { default: Anthropic }
})

const getMessage = (overrides: Record<string, unknown> = {}) => ({
  content: [{ type: 'text', text: 'jawaban agent' }],
  stop_reason: 'end_turn',
  usage: { input_tokens: 120, output_tokens: 45 },
  ...overrides,
})

const getInput = (overrides: Record<string, unknown> = {}) => ({
  apiKey: 'sk-ant-uji',
  model: 'claude-opus-5',
  instructions: 'Jadilah asisten akuntansi.',
  input: 'Berapa laba bulan lalu?',
  maxTokens: 16_000,
  effort: 'high' as const,
  temperature: null,
  ...overrides,
})

beforeEach(() => {
  createMock.mockReset()
  createMock.mockResolvedValue(getMessage())
})

describe('adaptor Anthropic', () => {
  it('TC-58a mengembalikan teks beserta pemakaian tokennya', async () => {
    const result = await runAnthropic(getInput())

    expect(result).toMatchObject({
      text: 'jawaban agent',
      inputTokens: 120,
      outputTokens: 45,
      stopReason: 'end_turn',
    })
  })

  it('TC-58b menyalakan penalaran adaptif dan effort untuk model yang mendukungnya', async () => {
    await runAnthropic(getInput({ effort: 'xhigh' }))

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-opus-5',
        system: 'Jadilah asisten akuntansi.',
        thinking: { type: 'adaptive' },
        output_config: { effort: 'xhigh' },
      })
    )
  })

  it('TC-58c tidak mengirim temperature ke model yang menolaknya', async () => {
    await runAnthropic(getInput({ temperature: 0.7 }))

    expect(createMock.mock.calls[0][0]).not.toHaveProperty('temperature')
  })

  it('TC-58d mengirim temperature ke model yang menerimanya, tanpa thinking', async () => {
    await runAnthropic(
      getInput({ model: 'claude-haiku-4-5', temperature: 0.7 })
    )

    const params = createMock.mock.calls[0][0]

    expect(params.temperature).toBe(0.7)
    expect(params).not.toHaveProperty('thinking')
    expect(params).not.toHaveProperty('output_config')
  })

  it('TC-58e tidak mengirim parameter thinking ke model yang penalarannya selalu menyala', async () => {
    await runAnthropic(getInput({ model: 'claude-fable-5-1' }))

    const params = createMock.mock.calls[0][0]

    expect(params).not.toHaveProperty('thinking')
    expect(params.output_config).toEqual({ effort: 'high' })
  })

  it('TC-58f hanya mengambil blok teks dari jawaban', async () => {
    createMock.mockResolvedValue(
      getMessage({
        content: [
          { type: 'thinking', thinking: 'penalaran yang tidak ditampilkan' },
          { type: 'text', text: 'baris pertama' },
          { type: 'text', text: 'baris kedua' },
        ],
      })
    )

    const result = await runAnthropic(getInput())

    expect(result.text).toBe('baris pertama\nbaris kedua')
  })

  it('TC-58g menjadikan penolakan model sebagai kegagalan, bukan jawaban kosong', async () => {
    createMock.mockResolvedValue(getMessage({ stop_reason: 'refusal' }))

    await expect(runAnthropic(getInput())).rejects.toMatchObject({
      code: 'AGENT_REFUSED',
      status: 422,
    })
  })

  it('TC-58h memetakan kegagalan provider ke kode yang bisa ditindaklanjuti', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default as unknown as {
      AuthenticationError: new (message?: string) => Error
      RateLimitError: new (message?: string) => Error
      APIError: new (message?: string, status?: number) => Error
    }

    createMock.mockRejectedValue(new Anthropic.AuthenticationError('kunci salah'))
    await expect(runAnthropic(getInput())).rejects.toMatchObject({
      code: 'PROVIDER_UNAUTHORIZED',
    })

    createMock.mockRejectedValue(new Anthropic.RateLimitError('terlalu sering'))
    await expect(runAnthropic(getInput())).rejects.toMatchObject({
      code: 'PROVIDER_RATE_LIMITED',
      status: 503,
    })

    createMock.mockRejectedValue(new Anthropic.APIError('rusak', 500))
    await expect(runAnthropic(getInput())).rejects.toMatchObject({
      code: 'PROVIDER_FAILED',
    })

    createMock.mockRejectedValue(new Error('koneksi putus'))
    const failure = await runAnthropic(getInput()).catch((error) => error)
    expect(failure).toBeInstanceOf(ProviderError)
    expect(failure.code).toBe('PROVIDER_UNREACHABLE')
  })
})
