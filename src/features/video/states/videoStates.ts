import { create } from 'zustand'

import type { DataVideo, PayloadGetVideo, Video } from '../types/videoTypes'

interface VideoStore {
  payloadGetVideo: PayloadGetVideo
  video: Video
  setGetVideo: (payload: Partial<PayloadGetVideo>) => void
  setVideo: (video: Partial<Video>) => void
}

export const useVideoStates = create<VideoStore>((set) => ({
  payloadGetVideo: { id: '' },

  video: {
    status: 'loading',
    statusTitle: 'Video Tidak Ditemukan',
    statusSubtitle: 'Video yang kamu cari tidak ada atau sudah dihapus.',
    data: null as DataVideo | null,
  },

  setGetVideo: (payload) =>
    set((state) => ({ payloadGetVideo: { ...state.payloadGetVideo, ...payload } })),

  setVideo: (video) => set((state) => ({ video: { ...state.video, ...video } })),
}))
