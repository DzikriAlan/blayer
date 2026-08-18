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

export interface FormsFieldInput {
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
  /** Kosong berarti analisis AI dimatikan untuk form ini. */
  purpose: string
  /** Id template asal; menentukan bentuk dashboard hasil. */
  templateId: string
  isPublished: boolean
  fields: FormsFieldInput[]
}

export interface PayloadGetFormsDetail {
  id: string
}

export interface DataForms {
  id: string
  title: string
  description: string
  purpose: string
  isAiEnabled: boolean
  isPublished: boolean
  totalField: number
  totalResponse: number
  createdAt: string
}

export interface Forms {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataForms[]
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
  purpose: string
  isAiEnabled: boolean
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
