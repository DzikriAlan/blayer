import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { runOpenai } from '@/server/shared/services/providers/openai.provider'

const fetchMock = vi.fn()

const getInput = (overrides: Record<string, unknown> = {}) => ({
  apiKey: 'sk-uji',
  model: 'model-uji',
  instructions: 'Jadilah asisten akuntansi.',
  messages: [{ role: 'user' as const, content: 'Berapa laba bulan lalu?' }],
  tools: [],
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

describe('tool pada adaptor Chat Completions', () => {
  it('TC-75a mengirim kontrak tool sebagai function', async () => {
    fetchMock.mockResolvedValue(
      getJsonResponse(200, {
        choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }],
        usage: {},
      })
    )

    await runOpenai(
      getInput({
        tools: [
          {
            name: 'get_profit_loss',
            description: 'Ambil laporan laba rugi.',
            inputSchema: { type: 'object', properties: {} },
          },
        ],
      })
    )

    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string
    )

    expect(body.tools).toEqual([
      {
        type: 'function',
        function: {
          name: 'get_profit_loss',
          description: 'Ambil laporan laba rugi.',
          parameters: { type: 'object', properties: {} },
        },
      },
    ])
  })

  it('TC-75b membaca permintaan tool dan memulihkan argumen JSON-nya', async () => {
    fetchMock.mockResolvedValue(
      getJsonResponse(200, {
        choices: [
          {
            message: {
              content: null,
              tool_calls: [
                {
                  id: 'call_1',
                  function: {
                    name: 'get_profit_loss',
                    arguments: '{"month":"2026-08"}',
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: {},
      })
    )

    const result = await runOpenai(getInput())

    expect(result.toolCalls).toEqual([
      { id: 'call_1', name: 'get_profit_loss', input: { month: '2026-08' } },
    ])
  })

  it('TC-75c tidak jatuh saat argumen toolnya bukan JSON utuh', async () => {
    fetchMock.mockResolvedValue(
      getJsonResponse(200, {
        choices: [
          {
            message: {
              content: null,
              tool_calls: [
                { id: 'call_1', function: { name: 'x', arguments: '{"month":' } },
              ],
            },
          },
        ],
        usage: {},
      })
    )

    const result = await runOpenai(getInput())

    expect(result.toolCalls[0].input).toEqual({})
  })

  it('TC-75d mengirim hasil tool sebagai pesan tool', async () => {
    fetchMock.mockResolvedValue(
      getJsonResponse(200, {
        choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }],
        usage: {},
      })
    )

    await runOpenai(
      getInput({
        messages: [
          { role: 'user', content: 'berapa laba?' },
          {
            role: 'assistant',
            content: '',
            toolCalls: [{ id: 'call_1', name: 'get_profit_loss', input: { month: '08' } }],
          },
          { role: 'tool', toolCallId: 'call_1', content: '{"laba":12}' },
        ],
      })
    )

    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string
    )

    expect(body.messages[2]).toMatchObject({
      role: 'assistant',
      tool_calls: [
        {
          id: 'call_1',
          type: 'function',
          function: { name: 'get_profit_loss', arguments: '{"month":"08"}' },
        },
      ],
    })
    expect(body.messages[3]).toEqual({
      role: 'tool',
      tool_call_id: 'call_1',
      content: '{"laba":12}',
    })
  })
})
