import { create } from 'zustand'

export interface Conversation {
  sessionId: string
  title: string | null
  createdAt: string
  updatedAt: string
}

interface ConversationHistoryStore {
  conversations: Conversation[]
  hasLoaded: boolean
  deletingIds: string[]
  setConversations: (conversations: Conversation[]) => void
  removeConversation: (sessionId: string) => void
  renameConversation: (sessionId: string, title: string) => void
  markDeleting: (sessionId: string, isDeleting: boolean) => void
}

export const useConversationHistoryStates = create<ConversationHistoryStore>((set) => ({
  conversations: [],
  hasLoaded: false,
  deletingIds: [],

  setConversations: (conversations) => set({ conversations, hasLoaded: true }),

  removeConversation: (sessionId) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.sessionId !== sessionId),
      deletingIds: state.deletingIds.filter((id) => id !== sessionId),
    })),

  renameConversation: (sessionId, title) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c.sessionId === sessionId ? { ...c, title } : c)),
    })),

  markDeleting: (sessionId, isDeleting) =>
    set((state) => ({
      deletingIds: isDeleting
        ? [...state.deletingIds, sessionId]
        : state.deletingIds.filter((id) => id !== sessionId),
    })),
}))
