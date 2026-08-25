export type FormsFieldType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'NUMBER'
  | 'EMAIL'
  | 'PHONE'
  | 'URL'
  | 'DATE'
  | 'TIME'
  | 'SELECT'
  | 'RADIO'
  | 'CHECKBOX'
  | 'RATING'
  | 'SCALE'
  | 'MENU'
  | 'PAYMENT'

export interface FormsFieldInput {
  id?: string
  label: string
  description: string
  placeholder: string
  type: FormsFieldType
  isRequired: boolean
  options: string[]
}

export interface PayloadPostForms {
  title: string
  description: string
  templateId: string
  image: string
  meeting: string
  video: string
  qrisImage: string
  price: number
  isPublished: boolean
  fields: FormsFieldInput[]
}

export interface PayloadPutForms extends PayloadPostForms {
  id: string
}

export interface PayloadGetFormsDetail {
  id: string
}

export interface PayloadDeleteForms {
  id: string
}

export interface DataForms {
  id: string
  title: string
  description: string
  templateId: string
  isPublished: boolean
  totalFields: number
  totalResponses: number
  createdAt: string
}

export interface Forms {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataForms[]
}

export interface DataFormsPublic {
  id: string
  title: string
  description: string
  templateId: string
  image: string
  price: number
  totalFields: number
  totalResponses: number
  createdAt: string
}

export interface FormsPublic {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataFormsPublic[]
}

export interface DataFormsDetailField {
  id: string
  label: string
  description: string
  placeholder: string
  type: FormsFieldType
  isRequired: boolean
  options: string[]
  order: number
}

export interface DataFormsDetail {
  id: string
  title: string
  description: string
  templateId: string
  image: string
  meeting: string
  video: string
  qrisImage: string
  price: number
  isPublished: boolean
  createdAt: string
  fields: DataFormsDetailField[]
}

export interface FormsDetail {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataFormsDetail | null
}

export interface DataFormsCreated {
  id: string
  title: string
}

export interface FormsCreated {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataFormsCreated | null
}
