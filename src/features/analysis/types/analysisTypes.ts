export interface PayloadGetAnalysis {
  formId: string
}

export interface PayloadPostAnalysis {
  formId: string
}

export interface DataAnalysisRanking {
  responseId: string
  name: string
  rank: number
  score: number
  verdict: string
  strengths: string[]
  concerns: string[]
  reasoning: string
}

export interface DataAnalysis {
  id: string
  formId: string
  purpose: string
  summary: string
  recommendation: string
  ranking: DataAnalysisRanking[]
  createdAt: string
}

export interface Analysis {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataAnalysis | null
}
