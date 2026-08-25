export interface PayloadPostResponses {
  formId: string
  name: string
  email: string
  answers: Record<string, string | string[]>
  duration: number
}

export interface PayloadGetResponsesList {
  formId: string
}

export interface DataResponses {
  id: string
  totalResponses: number
  createdAt: string
  meeting: string
  video: string
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
  name: string
  email: string
  answers: Record<string, string | string[]>
  duration: number
  createdAt: string
}

export interface DataResponsesList {
  formId: string
  title: string
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
