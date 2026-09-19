import { beforeEach, describe, expect, it, vi } from 'vitest'

import { runAnthropic } from '@/server/shared/services/providers/anthropic.provider'
import { ProviderError } from '@/server/shared/services/providers/provider.types'

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
  messages: [{ role: 'user' as const, content: 'Berapa laba bulan lalu?' }],
  tools: [],
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
      toolCalls: [],
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

describe('tool pada adaptor Anthropic', () => {
  it('TC-74a mengirim kontrak tool apa adanya ke provider', async () => {
    await runAnthropic(
      getInput({
        tools: [
          {
            name: 'get_profit_loss',
            description: 'Ambil laporan laba rugi.',
            inputSchema: { type: 'object', properties: { month: { type: 'string' } } },
          },
        ],
      })
    )

    expect(createMock.mock.calls[0][0].tools).toEqual([
      {
        name: 'get_profit_loss',
        description: 'Ambil laporan laba rugi.',
        input_schema: { type: 'object', properties: { month: { type: 'string' } } },
      },
    ])
  })

  it('TC-74b tidak mengirim daftar tool saat agentnya memang tidak punya', async () => {
    await runAnthropic(getInput())

    expect(createMock.mock.calls[0][0]).not.toHaveProperty('tools')
  })

  it('TC-74c membaca permintaan tool beserta masukannya', async () => {
    createMock.mockResolvedValue(
      getMessage({
        content: [
          { type: 'text', text: 'sebentar' },
          {
            type: 'tool_use',
            id: 'toolu_1',
            name: 'get_profit_loss',
            input: { month: '2026-08' },
          },
        ],
        stop_reason: 'tool_use',
      })
    )

    const result = await runAnthropic(getInput())

    expect(result.toolCalls).toEqual([
      { id: 'toolu_1', name: 'get_profit_loss', input: { month: '2026-08' } },
    ])
    expect(result.text).toBe('sebentar')
  })

  it('TC-74d mengumpulkan semua hasil tool dalam satu pesan user', async () => {
    await runAnthropic(
      getInput({
        messages: [
          { role: 'user', content: 'berapa laba?' },
          {
            role: 'assistant',
            content: 'sebentar',
            toolCalls: [
              { id: 'toolu_1', name: 'a', input: {} },
              { id: 'toolu_2', name: 'b', input: {} },
            ],
          },
          { role: 'tool', toolCallId: 'toolu_1', content: '{"laba":12}' },
          { role: 'tool', toolCallId: 'toolu_2', content: 'gagal', isError: true },
        ],
      })
    )

    const messages = createMock.mock.calls[0][0].messages

    expect(messages).toHaveLength(3)
    expect(messages[1]).toMatchObject({ role: 'assistant' })
    expect(messages[2]).toEqual({
      role: 'user',
      content: [
        { type: 'tool_result', tool_use_id: 'toolu_1', content: '{"laba":12}' },
        {
          type: 'tool_result',
          tool_use_id: 'toolu_2',
          content: 'gagal',
          is_error: true,
        },
      ],
    })
  })
})
