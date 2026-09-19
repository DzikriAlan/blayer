import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BlayerError, createClient } from '@blayer/sdk'

const fetchMock = vi.fn()

const getEnvelope = (status: number, payload: Record<string, unknown>) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  }) as Response

const getClient = (options: Record<string, unknown> = {}) =>
  createClient({
    baseUrl: 'https://blayer.test/',
    apiKey: 'blr_kunci',
    fetch: fetchMock as unknown as typeof fetch,
    ...options,
  })

beforeEach(() => {
  fetchMock.mockReset()
})

describe('klien SDK', () => {
  it('TC-80a memanggil rute eksekusi dengan API key project', async () => {
    fetchMock.mockResolvedValue(
      getEnvelope(200, {
        success: true,
        data: { runId: 'run-1', output: 'halo', status: 'SUCCEEDED' },
      })
    )

    const run = await getClient().agents.run({
      agentId: 'agent-1',
      input: 'halo',
      sessionId: 'session-1',
    })

    const [url, init] = fetchMock.mock.calls[0]

    expect(url).toBe('https://blayer.test/api/v1/agents/agent-1/run')
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer blr_kunci',
    })
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      input: 'halo',
      sessionId: 'session-1',
    })
    expect(run.output).toBe('halo')
  })

  it('TC-80b menutup rapat konfirmasi tool tulis lewat rute konfirmasi', async () => {
    fetchMock.mockResolvedValue(
      getEnvelope(200, { success: true, data: { runId: 'run-1', status: 'SUCCEEDED' } })
    )

    await getClient().runs.confirm({
      runId: 'run-1',
      toolCallId: 'tool-call-1',
      decision: 'REJECT',
    })

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://blayer.test/api/v1/runs/run-1/confirm'
    )
    expect(
      JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)
    ).toEqual({ toolCallId: 'tool-call-1', decision: 'REJECT' })
  })

  it('TC-80c menolak mendaftarkan tool tanpa token pengelolaan', async () => {
    const failure = await getClient()
      .tools.register({
        integrationId: 'integration-1',
        name: 'get_profit_loss',
        description: 'Ambil laporan laba rugi.',
        path: '/ai/tools/profit-loss',
        inputSchema: { type: 'object' },
      })
      .catch((error: unknown) => error)

    expect(failure).toBeInstanceOf(BlayerError)
    expect((failure as BlayerError).code).toBe('MISSING_CREDENTIALS')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('TC-80d memakai token pengelolaan saat mendaftarkan tool', async () => {
    fetchMock.mockResolvedValue(
      getEnvelope(201, { success: true, data: { id: 'tool-1' } })
    )

    await getClient({ adminToken: 'token-admin' }).tools.register({
      integrationId: 'integration-1',
      name: 'get_profit_loss',
      description: 'Ambil laporan laba rugi.',
      path: '/ai/tools/profit-loss',
      inputSchema: { type: 'object' },
    })

    expect((fetchMock.mock.calls[0][1] as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer token-admin',
    })
  })

  it('TC-80e melempar kegagalan API beserta kode dan requestId-nya', async () => {
    fetchMock.mockResolvedValue(
      getEnvelope(409, {
        success: false,
        error: {
          code: 'AGENT_NOT_PUBLISHED',
          message: 'Agent ini belum punya versi yang dipublikasikan.',
          details: null,
        },
        meta: { requestId: 'req-1' },
      })
    )

    const failure = (await getClient()
      .agents.run({ agentId: 'agent-1', input: 'halo' })
      .catch((error: unknown) => error)) as BlayerError

    expect(failure).toMatchObject({
      code: 'AGENT_NOT_PUBLISHED',
      status: 409,
      requestId: 'req-1',
    })
  })

  it('TC-80f menyebut instance yang tidak bisa dihubungi apa adanya', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))

    const failure = (await getClient()
      .agents.run({ agentId: 'agent-1', input: 'halo' })
      .catch((error: unknown) => error)) as BlayerError

    expect(failure.code).toBe('UNREACHABLE')
  })
})
