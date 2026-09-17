import { create } from 'zustand'
import type { PayloadPostChat, Chat } from '../types/chatTypes'

interface ChatStore {
  payloadPostChat: PayloadPostChat
  chat: Chat

  setPayloadPostChat: (payload: Partial<PayloadPostChat>) => void
  setChat: (payload: Partial<Chat> | ((state: Chat) => Partial<Chat>)) => void
}

export const useChatStates = create<ChatStore>((set) => ({
  payloadPostChat: {
    message: '',
    sessionId: '',
    agentId: '',
  },

  chat: {
    status: 'idle',
    statusTitle: '',
    statusSubtitle: '',
    data: null,
  },

  setPayloadPostChat: (payload) =>
    set((state) => ({
      payloadPostChat: { ...state.payloadPostChat, ...payload },
    })),

  setChat: (payload) =>
    set((state) => ({
      chat: { ...state.chat, ...(typeof payload === 'function' ? payload(state.chat) : payload) },
    })),
}))
