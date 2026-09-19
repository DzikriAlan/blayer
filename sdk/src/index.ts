/**
 * Klien resmi Blayer.
 *
 * Project consumer memakai API key project (berawalan `blr_`) untuk menjalankan
 * agent. Pendaftaran tool memakai token pengelolaan instance, karena itu
 * wewenang operator, bukan pemanggil biasa.
 */

export type BlayerEnvironment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'
export type BlayerRunStatus = 'SUCCEEDED' | 'FAILED' | 'PENDING_CONFIRMATION'
export type BlayerToolMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type BlayerToolPermission = 'READ' | 'WRITE'

export interface BlayerToolCall {
  id: string
  name: string
  permission: BlayerToolPermission
  status: string
  input: Record<string, unknown>
  output: string
}

export interface BlayerRun {
  runId: string
  agentId: string
  version: number
  versionId: string
  environment: BlayerEnvironment
  provider: string
  model: string
  status: BlayerRunStatus
  output: string
  stopReason: string
  latencyMs: number
  inputTokens: number
  outputTokens: number
  costUsd: number | null
  sessionId: string | null
  toolCalls: BlayerToolCall[]
  pendingToolCall: {
    id: string
    name: string
    input: Record<string, unknown>
  } | null
}

export interface BlayerSession {
  id: string
  environment: BlayerEnvironment
  createdAt: string
}

export interface BlayerClientOptions {
  /** Alamat instance Blayer, mis. https://blayer.id */
  baseUrl: string
  /** API key project, berawalan `blr_`. */
  apiKey?: string
  /** Token pengelolaan instance; hanya dibutuhkan untuk mendaftarkan tool. */
  adminToken?: string
  /** Batas waktu tiap permintaan dalam milidetik. Bawaan 60 detik. */
  timeoutMs?: number
  fetch?: typeof fetch
}

export class BlayerError extends Error {
  readonly code: string
  readonly status: number
  readonly requestId: string

  constructor(code: string, message: string, status: number, requestId = '') {
    super(message)
    this.name = 'BlayerError'
    this.code = code
    this.status = status
    this.requestId = requestId
  }
}

interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  data?: T
  meta?: { requestId?: string }
  error?: { code?: string; message?: string; details?: unknown } | null
}

export class BlayerClient {
  private readonly baseUrl: string
  private readonly apiKey?: string
  private readonly adminToken?: string
  private readonly timeoutMs: number
  private readonly fetchImpl: typeof fetch

  constructor(options: BlayerClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '')
    this.apiKey = options.apiKey
    this.adminToken = options.adminToken
    this.timeoutMs = options.timeoutMs ?? 60_000
    this.fetchImpl = options.fetch ?? globalThis.fetch
  }

  private async request<T>(
    path: string,
    { method = 'POST', body, isAdmin = false }: {
      method?: string
      body?: unknown
      isAdmin?: boolean
    } = {}
  ): Promise<T> {
    const token = isAdmin ? this.adminToken : (this.apiKey ?? this.adminToken)

    if (!token) {
      throw new BlayerError(
        'MISSING_CREDENTIALS',
        isAdmin
          ? 'Operasi ini butuh adminToken.'
          : 'Klien ini belum diberi apiKey.',
        401
      )
    }

    let response: Response

    try {
      response = await this.fetchImpl(`${this.baseUrl}/api/v1${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(this.timeoutMs),
      })
    } catch {
      throw new BlayerError(
        'UNREACHABLE',
        `Instance Blayer di ${this.baseUrl} tidak bisa dihubungi.`,
        503
      )
    }

    let payload: ApiEnvelope<T> = {}

    try {
      payload = (await response.json()) as ApiEnvelope<T>
    } catch {
      throw new BlayerError(
        'INVALID_RESPONSE',
        `Jawaban bukan JSON (${response.status}).`,
        response.status
      )
    }

    if (!response.ok || !payload.success) {
      throw new BlayerError(
        payload.error?.code ?? 'REQUEST_FAILED',
        payload.error?.message ??
          payload.message ??
          `Permintaan gagal (${response.status}).`,
        response.status,
        payload.meta?.requestId ?? ''
      )
    }

    return payload.data as T
  }

  agents = {
    /** Menjalankan versi production sebuah agent. */
    run: (params: {
      agentId: string
      input: string
      sessionId?: string
      /** Hanya berlaku dengan adminToken; API key project selalu versi production. */
      versionId?: string
      environment?: BlayerEnvironment
    }): Promise<BlayerRun> => {
      const { agentId, ...body } = params

      return this.request<BlayerRun>(`/agents/${agentId}/run`, { body })
    },

    /** Membuka sesi percakapan supaya agent mengingat pesan sebelumnya. */
    createSession: (params: {
      agentId: string
      environment?: BlayerEnvironment
    }): Promise<BlayerSession> => {
      const { agentId, ...body } = params

      return this.request<BlayerSession>(`/agents/${agentId}/sessions`, { body })
    },
  }

  runs = {
    /**
     * Menjawab permintaan konfirmasi tool yang mengubah data. Tool tidak akan
     * pernah berjalan tanpa panggilan ini.
     */
    confirm: (params: {
      runId: string
      toolCallId: string
      decision: 'CONFIRM' | 'REJECT'
    }): Promise<BlayerRun> => {
      const { runId, ...body } = params

      return this.request<BlayerRun>(`/runs/${runId}/confirm`, { body })
    },
  }

  tools = {
    /**
     * Mendaftarkan kontrak tool dari kode project, tanpa membuka Console.
     * Butuh adminToken.
     */
    register: (params: {
      integrationId: string
      name: string
      description: string
      path: string
      method?: BlayerToolMethod
      permission?: BlayerToolPermission
      inputSchema: Record<string, unknown>
    }): Promise<{ id: string; name: string; permission: BlayerToolPermission }> => {
      const { integrationId, ...body } = params

      return this.request(`/integrations/${integrationId}/tools`, {
        body,
        isAdmin: true,
      })
    },
  }
}

export const createClient = (options: BlayerClientOptions) =>
  new BlayerClient(options)
