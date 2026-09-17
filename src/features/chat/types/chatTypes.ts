export interface PayloadPostChat {
  message: string
  sessionId: string
  agentId?: string
  userId?: string
}

export interface DataChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

export interface Chat {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataChatMessage[] | null
}

export interface DataChatConversation {
  sessionId: string
  title: string | null
  createdAt: string
  updatedAt: string
}

export interface DataChatConversationDetail {
  id: string
  role: string
  content: string
  createdAt: string
}

export interface PayloadPostChatConversationsRename {
  title: string
}
