/**
 * Pembersih payload form yang dipakai bersama oleh pembuatan dan penyuntingan.
 *
 * Dulu aturannya hanya ada di handler POST. Begitu PUT ikut menulis kolom yang
 * sama, aturan yang disalin akan langsung menyimpang — mis. harga negatif
 * ditolak saat membuat tapi lolos saat menyunting. Semua normalisasi karena itu
 * tinggal di satu tempat ini.
 */

export interface FormFieldInput {
  /** Ada saat menyunting field lama; kosong berarti field baru. */
  id?: string
  label?: string
  description?: string
  placeholder?: string
  type?: string
  isRequired?: boolean
  options?: string[]
}

export interface FormBodyInput {
  title?: string
  description?: string
  purpose?: string
  templateId?: string
  bannerUrl?: string
  meetingUrl?: string
  videoUrl?: string
  qrisUrl?: string
  priceAmount?: number
  isPublished?: boolean
  fields?: FormFieldInput[]
}

/** Jenis field yang dikenal database. Nilai di luar daftar ini akan membuat
 *  Prisma melempar error mentah, jadi disaring lebih dulu di sini. */
export const FIELD_TYPES = [
  'SHORT_TEXT',
  'LONG_TEXT',
  'NUMBER',
  'EMAIL',
  'PHONE',
  'URL',
  'DATE',
  'TIME',
  'SELECT',
  'RADIO',
  'CHECKBOX',
  'RATING',
  'SCALE',
  'MENU',
  'PAYMENT',
] as const

const MAX_FIELD = 100
const MAX_TITLE = 200

const getTrimmed = (value: unknown) =>
  typeof value === 'string' ? value.trim() : ''

/** Kosong disimpan sebagai null, bukan string kosong, supaya pengecekan
 *  `!form.purpose` di seluruh aplikasi punya satu arti saja. */
const getNullable = (value: unknown) => getTrimmed(value) || null

export interface FormInputError {
  message: string
}

export const getFormsInput = (body: FormBodyInput) => {
  const title = getTrimmed(body.title)
  const fields = body.fields ?? []

  if (!title) return { error: { message: 'Judul form wajib diisi.' } }

  if (title.length > MAX_TITLE) {
    return { error: { message: `Judul form maksimal ${MAX_TITLE} karakter.` } }
  }

  if (!fields.length) {
    return { error: { message: 'Form butuh minimal satu field.' } }
  }

  if (fields.length > MAX_FIELD) {
    return { error: { message: `Form maksimal ${MAX_FIELD} field.` } }
  }

  const invalid = fields.find((field) => !getTrimmed(field.label))
  if (invalid) {
    return { error: { message: 'Setiap field wajib punya label pertanyaan.' } }
  }

  const unknownType = fields.find(
    (field) =>
      !FIELD_TYPES.includes((field.type ?? '') as (typeof FIELD_TYPES)[number])
  )

  if (unknownType) {
    return {
      error: { message: `Jenis field "${unknownType.type}" tidak dikenal.` },
    }
  }

  return {
    data: {
      title,
      description: getNullable(body.description),
      purpose: getNullable(body.purpose),
      templateId: getNullable(body.templateId),
      bannerUrl: getNullable(body.bannerUrl),
      meetingUrl: getNullable(body.meetingUrl),
      videoUrl: getNullable(body.videoUrl),
      qrisUrl: getNullable(body.qrisUrl),
      // Harga negatif atau bukan angka diabaikan supaya tagihan tetap masuk akal.
      priceAmount:
        typeof body.priceAmount === 'number' &&
        Number.isFinite(body.priceAmount) &&
        body.priceAmount > 0
          ? Math.round(body.priceAmount)
          : null,
      isPublished: body.isPublished ?? true,
      fields: fields.map((field, index) => ({
        id: getTrimmed(field.id) || undefined,
        label: getTrimmed(field.label),
        description: getNullable(field.description),
        placeholder: getNullable(field.placeholder),
        type: field.type as (typeof FIELD_TYPES)[number],
        isRequired: field.isRequired ?? false,
        options: field.options?.length ? field.options : undefined,
        order: index,
      })),
    },
  }
}
