import { useMutation } from '@tanstack/react-query'
import { useChatStates } from '../states/chatStates'
import { postChat } from '../services/chatServices'
import type { PayloadPostChat } from '../types/chatTypes'

export const useChatControllers = () => {
  const { setChat } = useChatStates()

  const storeChat = useMutation({
    mutationFn: (payload: PayloadPostChat) => postChat(payload),
    onMutate: () => {
      setChat({ status: 'loading', statusTitle: 'Mengirim...' })
    },
    onError: (error) => {
      const err = error instanceof Error ? error.message : 'Gagal mengirim pesan'
      setChat({ status: 'error', statusTitle: 'Error', statusSubtitle: err })
    },
  })

  return { storeChat }
}
