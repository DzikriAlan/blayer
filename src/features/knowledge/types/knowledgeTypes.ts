export interface DataKnowledge {
  id: string
  title: string
  preview: string
  totalChars: number
  updatedAt: string
}

export interface PayloadGetKnowledge {
  projectId: string
}

export interface PayloadPostKnowledge {
  projectId: string
  title: string
  content: string
}

export interface PayloadDeleteKnowledge {
  id: string
}

export interface Knowledge {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataKnowledge[]
}
