import { consoleFetch } from '@/shared/lib/consoleClient'
import type {
  DataConsoleSession,
  PayloadPostConsoleLogin,
} from '../types/consoleTypes'

export const postConsoleLogin = (payload: PayloadPostConsoleLogin) =>
  consoleFetch<DataConsoleSession>('/auth/login', {
    method: 'POST',
    isPublic: true,
    body: JSON.stringify(payload),
  })
