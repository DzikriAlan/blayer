import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IntegrationAuth, ToolMethod, ToolPermission } from '@prisma/client'

import { encryptSecret } from '@/shared/lib/agentCrypto'
import { executeTool } from '@/shared/lib/toolExecutor'

const fetchMock = vi.fn()

const getIntegration = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'integration-1',
    projectId: 'project-1',
    slug: 'easyaccounting',
    name: 'EasyAccounting',
    description: null,
    baseUrl: 'https://app.easyaccounting.test/api',
    auth: IntegrationAuth.NONE,
    authHeader: null,
    secret: null,
    hint: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as never

const getDefinition = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'tool-1',
    integrationId: 'integration-1',
    name: 'get_profit_loss',
    description: 'Ambil laporan laba rugi.',
    method: ToolMethod.GET,
    path: '/ai/tools/profit-loss',
    permission: ToolPermission.READ,
    inputSchema: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as never

const getResponse = (status: number, body: string) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
  }) as Response

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  process.env.BLAYER_ENCRYPTION_KEY = Buffer.alloc(32, 4).toString('base64')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('pemanggilan endpoint tool', () => {
  it('TC-76a mengirim sisa masukan sebagai query untuk method GET', async () => {
    fetchMock.mockResolvedValue(getResponse(200, '{"laba":12}'))

    const result = await executeTool({
      integration: getIntegration(),
      definition: getDefinition(),
      input: { month: '2026-08' },
    })

    expect(result).toMatchObject({ isOk: true, output: '{"laba":12}' })
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://app.easyaccounting.test/api/ai/tools/profit-loss?month=2026-08'
    )
    expect(fetchMock.mock.calls[0][1]).not.toHaveProperty('body')
  })

  it('TC-76b menaruh nilai path ke dalam path dan tidak mengirimnya dua kali', async () => {
    fetchMock.mockResolvedValue(getResponse(200, 'ok'))

    await executeTool({
      integration: getIntegration(),
      definition: getDefinition({ path: '/invoices/{invoiceId}' }),
      input: { invoiceId: 'inv 12', note: 'x' },
    })

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://app.easyaccounting.test/api/invoices/inv%2012?note=x'
    )
  })

  it('TC-76c mengirim masukan sebagai body JSON untuk method yang mengubah data', async () => {
    fetchMock.mockResolvedValue(getResponse(200, 'ok'))

    await executeTool({
      integration: getIntegration(),
      definition: getDefinition({
        method: ToolMethod.POST,
        permission: ToolPermission.WRITE,
        path: '/invoices',
      }),
      input: { amount: 1000 },
    })

    const init = fetchMock.mock.calls[0][1] as RequestInit

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://app.easyaccounting.test/api/invoices'
    )
    expect(JSON.parse(init.body as string)).toEqual({ amount: 1000 })
  })

  it('TC-76d memasang kredensial integration sesuai caranya', async () => {
    fetchMock.mockResolvedValue(getResponse(200, 'ok'))

    await executeTool({
      integration: getIntegration({
        auth: IntegrationAuth.BEARER,
        secret: encryptSecret('token-project'),
      }),
      definition: getDefinition(),
      input: {},
    })

    expect(
      (fetchMock.mock.calls[0][1] as RequestInit).headers
    ).toMatchObject({ Authorization: 'Bearer token-project' })

    fetchMock.mockClear()

    await executeTool({
      integration: getIntegration({
        auth: IntegrationAuth.HEADER,
        authHeader: 'X-Internal-Key',
        secret: encryptSecret('kunci-internal'),
      }),
      definition: getDefinition(),
      input: {},
    })

    expect(
      (fetchMock.mock.calls[0][1] as RequestInit).headers
    ).toMatchObject({ 'X-Internal-Key': 'kunci-internal' })
  })

  it('TC-76e menolak memanggil saat kredensialnya tidak bisa dibuka', async () => {
    const integration = getIntegration({
      auth: IntegrationAuth.BEARER,
      secret: encryptSecret('token-project'),
    })

    process.env.BLAYER_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString('base64')

    const result = await executeTool({
      integration,
      definition: getDefinition(),
      input: {},
    })

    expect(result.isOk).toBe(false)
    expect(result.output).toContain('BLAYER_ENCRYPTION_KEY')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('TC-76f mengembalikan kegagalan endpoint apa adanya, bukan melemparnya', async () => {
    fetchMock.mockResolvedValue(getResponse(422, '{"message":"periode salah"}'))

    const result = await executeTool({
      integration: getIntegration(),
      definition: getDefinition(),
      input: {},
    })

    expect(result.isOk).toBe(false)
    expect(result.output).toContain('422')
    expect(result.output).toContain('periode salah')
  })

  it('TC-76g menyebut waktu tunggu habis sebagai sebab yang jelas', async () => {
    const timeout = new Error('timed out')
    timeout.name = 'TimeoutError'
    fetchMock.mockRejectedValue(timeout)

    const result = await executeTool({
      integration: getIntegration(),
      definition: getDefinition(),
      input: {},
    })

    expect(result.isOk).toBe(false)
    expect(result.output).toContain('tidak menjawab dalam')
  })

  it('TC-76h memotong jawaban raksasa supaya tidak menelan jendela konteks', async () => {
    fetchMock.mockResolvedValue(getResponse(200, 'x'.repeat(20_000)))

    const result = await executeTool({
      integration: getIntegration(),
      definition: getDefinition(),
      input: {},
    })

    expect(result.output.length).toBe(8_000)
  })
})
