import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  clearConsoleSession,
  setConsoleSession,
} from '@/shared/lib/consoleClient'
import { useConsoleStates } from '../states/consoleStates'
import { postConsoleLogin } from '../services/consoleServices'
import type { PayloadPostConsoleLogin } from '../types/consoleTypes'

export const useConsoleControllers = () => {
  const queryClient = useQueryClient()
  const { setSession, setDefaultCredentials, clearSession } = useConsoleStates()

  const storeConsoleLogin = useMutation({
    mutationFn: (payload: PayloadPostConsoleLogin) => postConsoleLogin(payload),
    onSuccess: (data) => {
      setConsoleSession({
        token: data.token,
        username: data.username,
        expiresAt: data.expiresAt,
      })
      setSession({ token: data.token, username: data.username })
      setDefaultCredentials(data.isDefaultCredentials)

      // Data yang sempat gagal dimuat tanpa sesi diminta ulang, bukan menunggu
      // operator memuat ulang halamannya sendiri.
      queryClient.invalidateQueries()
    },
  })

  const removeConsoleSession = () => {
    clearConsoleSession()
    clearSession()
    queryClient.clear()
  }

  return { storeConsoleLogin, removeConsoleSession }
}
