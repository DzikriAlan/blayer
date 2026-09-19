import { vi } from 'vitest'

export interface TestApiResponse {
  statusCode: number
  body: {
    success?: boolean
    message?: string
    data?: unknown
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    error?: {
      code: string
      message: string
      details: Record<string, string[]> | null
    } | null
  }
  headersSent: boolean
  headers: Record<string, string | string[]>
  setHeader(key: string, value: string | string[]): void
  getHeader(key: string): string | string[] | undefined
  status(code: number): TestApiResponse
  json(body: unknown): TestApiResponse
}

// Rute API diuji lewat handler-nya langsung, jadi objek req/res cukup yang
// dipakai handler — bukan seluruh permukaan Node.
export const getTestResponse = (): TestApiResponse => {
  const res: TestApiResponse = {
    statusCode: 0,
    body: {},
    headersSent: false,
    headers: {},
    setHeader(key, value) {
      res.headers[key] = value
    },
    getHeader(key) {
      return res.headers[key]
    },
    status(code) {
      res.statusCode = code
      return res
    },
    json(body) {
      res.body = body as TestApiResponse['body']
      return res
    },
  }

  return res
}

interface TestRequest {
  method?: string
  headers?: Record<string, string>
  query?: Record<string, string>
  body?: unknown
  socket?: { remoteAddress?: string }
}

export const getTestRequest = ({
  method = 'GET',
  headers = {},
  query = {},
  body,
  socket = { remoteAddress: '127.0.0.1' },
}: TestRequest = {}) => ({ method, headers, query, body, socket })

export const muteLogger = () => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
}
