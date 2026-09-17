import type { PayloadPostChat, DataChatConversation, DataChatConversationDetail } from '../types/chatTypes'
import { api, apiFetch } from '@/shared/lib/api'

export const postChat = async (payload: PayloadPostChat) => {
  try {
    const { message, sessionId, agentId, userId } = payload
    const res = await apiFetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sessionId,
        ...(agentId && { agentId }),
        ...(userId && { userId }),
      }),
    })
    if (!res.ok) throw new Error(res.statusText)
    return res
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getChatConversations = async (): Promise<DataChatConversation[]> => {
  const result = await api('GET', '/chat/conversations')
  return (result as DataChatConversation[]) ?? []
}

export const getChatConversationsDetail = async (sessionId: string): Promise<DataChatConversationDetail[]> => {
  const result = await api('GET', `/chat/conversations/${sessionId}`)
  return (result as DataChatConversationDetail[]) ?? []
}

export const postChatConversationsRename = async (sessionId: string, title: string) => {
  return await api('POST', `/chat/conversations/${sessionId}/rename`, { title })
}

export const deleteChatConversationsDetail = async (sessionId: string) => {
  return await api('DELETE', `/chat/conversations/${sessionId}`)
}
