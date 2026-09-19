import type { Integration, ToolDefinition } from '@prisma/client'

import { decryptSecret } from '../utils/crypto.util'

export const TOOL_TIMEOUT_MS = 20_000
const MAX_OUTPUT_CHARS = 8_000

export interface ToolExecutionResult {
  isOk: boolean
  output: string
  latencyMs: number
}

const getAuthHeaders = (
  integration: Integration
): Record<string, string> | null => {
  if (integration.auth === 'NONE' || !integration.secret) return {}

  const secret = decryptSecret(integration.secret)
  if (!secret) return null

  return integration.auth === 'BEARER'
    ? { Authorization: `Bearer ${secret}` }
    : { [integration.authHeader || 'X-Api-Key']: secret }
}

// Potongan path boleh memuat {nama}; nilainya diambil dari masukan tool dan
// dipakai habis, sehingga tidak ikut terkirim dua kali sebagai query atau body.
const getUrl = (
  integration: Integration,
  definition: ToolDefinition,
  input: Record<string, unknown>
) => {
  const rest: Record<string, unknown> = { ...input }

  const path = definition.path.replace(/\{(\w+)\}/g, (match, key: string) => {
    if (!(key in rest)) return match

    const value = String(rest[key] ?? '')
    delete rest[key]

    return encodeURIComponent(value)
  })

  const base = integration.baseUrl.replace(/\/+$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`

  return { url: `${base}${suffix}`, rest }
}

const getQuery = (rest: Record<string, unknown>) => {
  const query = new URLSearchParams()

  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null) return

    query.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
  })

  const text = query.toString()

  return text ? `?${text}` : ''
}

// Blayer hanya memegang kontraknya; yang dipanggil di sini adalah endpoint milik
// project. Hasilnya dipotong supaya jawaban raksasa tidak menelan jendela
// konteks model.
export const fetchToolCall = async ({
  integration,
  definition,
  input,
}: {
  integration: Integration
  definition: ToolDefinition
  input: Record<string, unknown>
}): Promise<ToolExecutionResult> => {
  const startedAt = Date.now()
  const authHeaders = getAuthHeaders(integration)

  if (!authHeaders) {
    return {
      isOk: false,
      output:
        'Kredensial integration tidak bisa dibuka di instance ini. Periksa BLAYER_ENCRYPTION_KEY.',
      latencyMs: Date.now() - startedAt,
    }
  }

  const { url, rest } = getUrl(integration, definition, input)
  const hasBody = definition.method !== 'GET' && definition.method !== 'DELETE'
  const target = hasBody ? url : `${url}${getQuery(rest)}`

  try {
    const response = await fetch(target, {
      method: definition.method,
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...authHeaders,
      },
      ...(hasBody ? { body: JSON.stringify(rest) } : {}),
      signal: AbortSignal.timeout(TOOL_TIMEOUT_MS),
    })

    const text = (await response.text()).slice(0, MAX_OUTPUT_CHARS)

    if (!response.ok) {
      return {
        isOk: false,
        output: `Endpoint tool menjawab ${response.status}. ${text}`.trim(),
        latencyMs: Date.now() - startedAt,
      }
    }

    return { isOk: true, output: text, latencyMs: Date.now() - startedAt }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'TimeoutError'

    return {
      isOk: false,
      output: isTimeout
        ? `Endpoint tool tidak menjawab dalam ${TOOL_TIMEOUT_MS / 1000} detik.`
        : 'Endpoint tool tidak bisa dihubungi.',
      latencyMs: Date.now() - startedAt,
    }
  }
}
