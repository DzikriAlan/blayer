import { describe, expect, it } from 'vitest'

import {
  FORMS_TEMPLATES,
  FORMS_TEMPLATE_DEFAULT_VIEW,
} from '@/features/forms/components/formsTemplate'

const getVisibleTemplates = () =>
  FORMS_TEMPLATES.filter((template) => template.isVisible)

const getOptions = (optionText: string) =>
  optionText
    .split('\n')
    .map((option) => option.trim())
    .filter(Boolean)

describe('katalog template', () => {
  it('TC-01 setiap template membawa judul dan minimal satu field', () => {
    getVisibleTemplates().forEach((template) => {
      expect(template.values.title.length).toBeGreaterThan(0)
      expect(template.values.fields.length).toBeGreaterThan(0)
    })
  })

  it('TC-04 setiap template punya view yang dikenali', () => {
    const views = ['scoring', 'survey', 'event']

    FORMS_TEMPLATES.forEach((template) => {
      expect(views).toContain(template.view)
    })
    expect(views).toContain(FORMS_TEMPLATE_DEFAULT_VIEW)
  })

  it('TC-21 tidak ada template yang menanyakan nama atau email lagi', () => {
    getVisibleTemplates().forEach((template) => {
      template.values.fields.forEach((field) => {
        const label = field.label.toLowerCase()

        expect(label).not.toContain('nama')
        expect(label).not.toContain('email')
        expect(field.type).not.toBe('EMAIL')
      })
    })
  })

  it('TC-02 field pilihan selalu punya minimal dua opsi', () => {
    const optionTypes = ['SELECT', 'RADIO', 'CHECKBOX']

    getVisibleTemplates().forEach((template) => {
      template.values.fields
        .filter((field) => optionTypes.includes(field.type))
        .forEach((field) => {
          expect(getOptions(field.optionText).length).toBeGreaterThanOrEqual(2)
        })
    })
  })
})

describe('katalog kategori halaman depan', () => {
  it('TC-36 kategori etalase tampil dalam urutan yang ditetapkan katalog', () => {
    const featuredIds = FORMS_TEMPLATES.filter(
      (template) => template.isFeatured
    ).map((template) => template.id)

    expect(featuredIds).toEqual([
      'event-tech',
      'event-sport',
      'event-music',
      'event-business',
    ])
  })

  it('TC-36 setiap kategori etalase juga bisa dipakai membuat form', () => {
    FORMS_TEMPLATES.filter((template) => template.isFeatured).forEach(
      (template) => expect(template.isVisible).toBe(true)
    )
  })
})

describe('template acara', () => {
  it('TC-25 pendaftar tidak lagi ditanya tanggal acara', () => {
    FORMS_TEMPLATES.filter((template) => template.view === 'event').forEach(
      (template) => {
        const hasDateField = template.values.fields.some(
          (field) => field.type === 'DATE'
        )

        expect(hasDateField).toBe(false)
      }
    )
  })

  it('TC-36 tiap kategori acara membawa naskah pengunjungnya sendiri', () => {
    const headings = FORMS_TEMPLATES.filter(
      (template) => template.isFeatured
    ).map((template) => template.copy?.heading)

    expect(headings.every(Boolean)).toBe(true)
    expect(new Set(headings).size).toBe(headings.length)
  })
})
