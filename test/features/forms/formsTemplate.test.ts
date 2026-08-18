import { describe, expect, it } from 'vitest'

import {
  FORMS_TEMPLATES,
  FORMS_TEMPLATE_DEFAULT_VIEW,
} from '@/features/forms/components/formsTemplate'

const getTemplate = (id: string) =>
  FORMS_TEMPLATES.find((template) => template.id === id)

const getVisibleTemplates = () =>
  FORMS_TEMPLATES.filter((template) => template.isVisible)

const getFieldLabels = (id: string) =>
  (getTemplate(id)?.values.fields ?? []).map((field) => field.label)

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
    const views = ['scoring', 'exam', 'survey', 'event', 'order', 'course']

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
    const optionTypes = ['SELECT', 'RADIO', 'CHECKBOX', 'MENU', 'PAYMENT']

    getVisibleTemplates().forEach((template) => {
      template.values.fields
        .filter((field) => optionTypes.includes(field.type))
        .forEach((field) => {
          expect(getOptions(field.optionText).length).toBeGreaterThanOrEqual(2)
        })
    })
  })
})

describe('template menu restoran', () => {
  const restaurant = getTemplate('restaurant')

  it('TC-18 memakai view order dan tampil di daftar pilihan', () => {
    expect(restaurant?.view).toBe('order')
    expect(restaurant?.isVisible).toBe(true)
  })

  it('TC-18 field yang dibutuhkan pesanan meja tersedia', () => {
    expect(getFieldLabels('restaurant')).toEqual([
      'Nomor Meja',
      'Pilih Menu',
      'Cara Penyajian',
      'Catatan untuk Dapur',
      'Metode Pembayaran',
    ])
  })

  it('TC-14 tiap opsi menu punya nama, harga angka, dan gambar', () => {
    const menu = restaurant?.values.fields.find(
      (field) => field.type === 'MENU'
    )

    expect(menu).toBeDefined()

    getOptions(menu?.optionText ?? '').forEach((option) => {
      const [name, price, imageUrl] = option.split('|')

      expect(name.trim().length).toBeGreaterThan(0)
      expect(Number(price)).toBeGreaterThan(0)
      expect(imageUrl.trim().length).toBeGreaterThan(0)
    })
  })

  it('TC-16 QRIS termasuk metode pembayaran yang ditawarkan', () => {
    const payment = restaurant?.values.fields.find(
      (field) => field.type === 'PAYMENT'
    )
    const methods = getOptions(payment?.optionText ?? '').map(
      (option) => option.split('|')[0]
    )

    expect(methods).toContain('QRIS')
    expect(methods.length).toBeGreaterThan(1)
  })
})

describe('template kursus kelas', () => {
  const course = getTemplate('course')

  it('TC-19 memakai view course dan tampil di daftar pilihan', () => {
    expect(course?.view).toBe('course')
    expect(course?.isVisible).toBe(true)
  })

  it('TC-19 peserta tidak diminta memilih paket kelas', () => {
    const hasMenuField = course?.values.fields.some(
      (field) => field.type === 'MENU'
    )

    expect(hasMenuField).toBe(false)
    expect(getFieldLabels('course')).toEqual([
      'Nomor WhatsApp',
      'Level Pengalamanmu',
      'Apa yang ingin kamu capai setelah kelas ini?',
      'Metode Pembayaran',
    ])
  })

  it('TC-20 harga kelas ditetapkan pembuat form sebagai angka positif', () => {
    expect(Number(course?.values.priceAmount)).toBeGreaterThan(0)
  })

  it('TC-15 kursus tetap menawarkan metode pembayaran', () => {
    const payment = course?.values.fields.find(
      (field) => field.type === 'PAYMENT'
    )

    expect(payment?.isRequired).toBe(true)
    expect(getOptions(payment?.optionText ?? '').length).toBeGreaterThan(1)
  })
})

describe('template acara', () => {
  it('TC-25 pendaftar tidak lagi ditanya tanggal acara', () => {
    const hasDateField = getTemplate('event')?.values.fields.some(
      (field) => field.type === 'DATE'
    )

    expect(hasDateField).toBe(false)
  })
})
