export interface PayloadPostResponses {
  formId: string
  respondentName: string
  respondentEmail: string
  answers: Record<string, string | string[]>
  durationSeconds: number
}

export interface PayloadGetResponsesList {
  formId: string
}

export interface DataResponses {
  id: string
  totalResponse: number
  createdAt: string
  meetingUrl: string
  videoUrl: string
}

export interface Responses {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataResponses | null
}

export interface DataResponsesListField {
  id: string
  label: string
  type: string
  options: string[]
  isRequired: boolean
}

export interface DataResponsesListItem {
  id: string
  respondentName: string
  respondentEmail: string
  answers: Record<string, string | string[]>
  durationSeconds: number
  createdAt: string
}

export interface DataResponsesList {
  formId: string
  formTitle: string
  purpose: string
  isAiEnabled: boolean
  templateId: string
  fields: DataResponsesListField[]
  responses: DataResponsesListItem[]
}

export interface ResponsesList {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataResponsesList | null
}
