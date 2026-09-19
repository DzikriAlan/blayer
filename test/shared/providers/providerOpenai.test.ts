import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { runOpenai } from '@/shared/lib/providers/providerOpenai'

const fetchMock = vi.fn()

const getInput = (overrides: Record<string, unknown> = {}) => ({
  apiKey: 'sk-uji',
  model: 'model-uji',
  instructions: 'Jadilah asisten akuntansi.',
  input: 'Berapa laba bulan lalu?',
  maxTokens: 2_048,
  effort: 'high' as const,
  temperature: null,
  ...overrides,
})

const getJsonResponse = (status: number, payload: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  }) as Response

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  delete process.env.OPENAI_BASE_URL
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('adaptor OpenAI', () => {
  it('TC-59a mengirim instruksi sebagai pesan sistem dan membaca pemakaian token', async () => {
    fetchMock.mockResolvedValue(
      getJsonResponse(200, {
        choices: [
          { message: { content: ' jawaban agent ' }, finish_reason: 'stop' },
        ],
        usage: { prompt_tokens: 80, completion_tokens: 20 },
      })
    )

    const result = await runOpenai(getInput({ temperature: 0.3 }))

    expect(result).toMatchObject({
      text: 'jawaban agent',
      inputTokens: 80,
      outputTokens: 20,
      stopReason: 'stop',
    })

    const [url, init] = fetchMock.mock.calls[0]
    const body = JSON.parse((init as RequestInit).body as string)

    expect(url).toBe('https://api.openai.com/v1/chat/completions')
    expect(body).toMatchObject({
      model: 'model-uji',
      max_completion_tokens: 2_048,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'Jadilah asisten akuntansi.' },
        { role: 'user', content: 'Berapa laba bulan lalu?' },
      ],
    })
  })

  it('TC-59b mengikuti OPENAI_BASE_URL untuk endpoint yang sebentuk', async () => {
    process.env.OPENAI_BASE_URL = 'https://gateway.internal/v1/'
    fetchMock.mockResolvedValue(
      getJsonResponse(200, {
        choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 1, completion_tokens: 1 },
      })
    )

    await runOpenai(getInput())

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://gateway.internal/v1/chat/completions'
    )
  })

  it('TC-59c tidak mengirim temperature kalau tidak diatur', async () => {
    fetchMock.mockResolvedValue(
      getJsonResponse(200, {
        choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }],
        usage: {},
      })
    )

    await runOpenai(getInput())

    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string
    )

    expect(body).not.toHaveProperty('temperature')
  })

  it('TC-59d memetakan status gagal ke kode yang membedakan sebabnya', async () => {
    fetchMock.mockResolvedValue(getJsonResponse(401, {}))
    await expect(runOpenai(getInput())).rejects.toMatchObject({
      code: 'PROVIDER_UNAUTHORIZED',
    })

    fetchMock.mockResolvedValue(getJsonResponse(429, {}))
    await expect(runOpenai(getInput())).rejects.toMatchObject({
      code: 'PROVIDER_RATE_LIMITED',
      status: 503,
    })

    fetchMock.mockResolvedValue(getJsonResponse(500, {}))
    await expect(runOpenai(getInput())).rejects.toMatchObject({
      code: 'PROVIDER_FAILED',
    })

    fetchMock.mockRejectedValue(new Error('koneksi putus'))
    await expect(runOpenai(getInput())).rejects.toMatchObject({
      code: 'PROVIDER_UNREACHABLE',
    })
  })

  it('TC-59e menolak jawaban yang tidak memuat teks', async () => {
    fetchMock.mockResolvedValue(getJsonResponse(200, { choices: [] }))

    await expect(runOpenai(getInput())).rejects.toMatchObject({
      code: 'PROVIDER_FAILED',
    })
  })

  it('TC-59f menganggap token tak terbaca sebagai nol, bukan NaN', async () => {
    fetchMock.mockResolvedValue(
      getJsonResponse(200, {
        choices: [{ message: { content: 'ok' } }],
        usage: { prompt_tokens: 'banyak' },
      })
    )

    const result = await runOpenai(getInput())

    expect(result.inputTokens).toBe(0)
    expect(result.outputTokens).toBe(0)
    expect(result.stopReason).toBe('stop')
  })
})
