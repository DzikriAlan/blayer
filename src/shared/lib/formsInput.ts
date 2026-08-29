import { getSlugError, getSlugged } from './formsSlug'

export interface FormFieldInput {
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
  slug?: string
  description?: string
  templateId?: string
  image?: string
  meeting?: string
  isPublished?: boolean
  fields?: FormFieldInput[]
}

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
] as const

const MAX_FIELD = 100
const MAX_TITLE = 200

const getTrimmed = (value: unknown) =>
  typeof value === 'string' ? value.trim() : ''

const getNullable = (value: unknown) => getTrimmed(value) || null

export interface FormInputError {
  code: string
  field: string
  message: string
}

export const getFormsInput = (body: FormBodyInput) => {
  const title = getTrimmed(body.title)
  const fields = body.fields ?? []
  const slug = getSlugged(getTrimmed(body.slug))

  if (getTrimmed(body.slug) && getSlugError(slug)) {
    return {
      error: {
        code: 'SLUG_INVALID',
        field: 'slug',
        message: getSlugError(slug),
      },
    }
  }

  if (!title) {
    return {
      error: { code: 'TITLE_REQUIRED', field: 'title', message: 'Judul form wajib diisi.' },
    }
  }

  if (title.length > MAX_TITLE) {
    return {
      error: {
        code: 'TITLE_TOO_LONG',
        field: 'title',
        message: `Judul form maksimal ${MAX_TITLE} karakter.`,
      },
    }
  }

  if (!fields.length) {
    return {
      error: { code: 'FIELDS_REQUIRED', field: 'fields', message: 'Form butuh minimal satu field.' },
    }
  }

  if (fields.length > MAX_FIELD) {
    return {
      error: {
        code: 'FIELDS_TOO_MANY',
        field: 'fields',
        message: `Form maksimal ${MAX_FIELD} field.`,
      },
    }
  }

  const invalid = fields.find((field) => !getTrimmed(field.label))
  if (invalid) {
    return {
      error: {
        code: 'FIELD_LABEL_REQUIRED',
        field: 'fields',
        message: 'Setiap field wajib punya label pertanyaan.',
      },
    }
  }

  const unknownType = fields.find(
    (field) =>
      !FIELD_TYPES.includes((field.type ?? '') as (typeof FIELD_TYPES)[number])
  )

  if (unknownType) {
    return {
      error: {
        code: 'FIELD_TYPE_UNKNOWN',
        field: 'fields',
        message: `Jenis field "${unknownType.type}" tidak dikenal.`,
      },
    }
  }

  return {
    data: {
      title,
      slug: slug || null,
      description: getNullable(body.description),
      templateId: getNullable(body.templateId),
      bannerUrl: getNullable(body.image),
      meetingUrl: getNullable(body.meeting),
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
