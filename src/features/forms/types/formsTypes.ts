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
  /** Banner acara hasil unggahan; kosong berarti tidak dipakai. */
  bannerUrl: string
  /** Link Google Meet acara; kosong berarti tidak dipakai. */
  meetingUrl: string
  /** Link video kelas; baru dibuka setelah peserta membayar dan mengisi form. */
  videoUrl: string
  /** Gambar QRIS pembuat form; dipindai pembayar saat memilih metode QRIS. */
  qrisUrl: string
  /** Harga tetap form berbayar tanpa field menu; 0 berarti tidak dipakai. */
  priceAmount: number
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
  /** Id template asal; dipakai memfilter riwayat form per template. */
  templateId: string
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

/**
 * Bentuk form di katalog publik.
 *
 * Lebih ramping daripada `DataForms` karena halaman depan tidak boleh menerima
 * `purpose` — isinya perintah AI milik pembuat form. `isPublished` juga tidak
 * ada: semua yang masuk daftar ini sudah pasti terpublikasi.
 */
export interface DataFormsPublic {
  id: string
  title: string
  description: string
  templateId: string
  totalField: number
  totalResponse: number
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
  purpose: string
  isAiEnabled: boolean
  /** Id template asal; menentukan mode pengerjaan dan bentuk dashboard hasil. */
  templateId: string
  bannerUrl: string
  meetingUrl: string
  videoUrl: string
  qrisUrl: string
  priceAmount: number
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
