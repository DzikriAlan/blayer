import { useMutation } from '@tanstack/react-query'
import {
  getChatConversations,
  getChatConversationsDetail,
  postChatConversationsRename,
  deleteChatConversationsDetail,
} from '../services/chatServices'

export const useConversationHistoryControllers = () => {
  const fetchChatConversations = () => getChatConversations()

  const fetchChatConversationsDetail = (sessionId: string) => getChatConversationsDetail(sessionId)

  const storeChatConversationsRename = useMutation({
    mutationFn: ({ sessionId, title }: { sessionId: string; title: string }) =>
      postChatConversationsRename(sessionId, title),
  })

  const removeChatConversationsDetail = useMutation({
    mutationFn: (sessionId: string) => deleteChatConversationsDetail(sessionId),
  })

  return {
    fetchChatConversations,
    fetchChatConversationsDetail,
    storeChatConversationsRename,
    removeChatConversationsDetail,
  }
}
