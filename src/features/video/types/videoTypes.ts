export interface PayloadGetVideo {
  id: string
}

export interface DataVideoChannel {
  id: string
  name: string
  url: string
  avatar: string
  verified: boolean
  subscribers: number
  subscribersLabel: string
  subscribeUrl: string
}

export interface DataVideo {
  id: string
  url: string
  embedUrl: string
  embedHtml: string
  embeddable: boolean
  title: string
  description: string
  publishDate: string
  uploadDate: string
  lengthSeconds: number
  category: string
  keywords: string[]
  views: number
  likes: number
  comments: number
  isLive: boolean
  isLiveNow: boolean
  watchingNow: number
  thumbnail: string
  channel: DataVideoChannel
}

export interface Video {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataVideo | null
}
