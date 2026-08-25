'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Loader2,
  Plus,
  Wallet,
} from 'lucide-react'

import type { FormsFieldType, PayloadPostForms } from '../types/formsTypes'
import { useFormsStates } from '../states/formsStates'
import { useFormsControllers } from '../controllers/formsControllers'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import SectionHead from '@/components/section-head'
import FormsFieldEditor from './formsFieldEditor'
import FormsTemplate, {
  FORMS_TEMPLATES,
  FORMS_TEMPLATE_DEFAULT_VIEW,
} from './formsTemplate'
import UploadsBanner from '@/features/uploads/components/uploadsBanner'

export const FORMS_CREATE_FORM_ID = 'forms-create'

const OPTION_TYPES: FormsFieldType[] = [
  'SELECT',
  'RADIO',
  'CHECKBOX',
  'MENU',
  'PAYMENT',
]

const PAID_VIEWS = ['order', 'course']

const fieldSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Pertanyaan wajib diisi'),
  description: z.string(),
  placeholder: z.string(),
  type: z.string(),
  isRequired: z.boolean(),
  optionText: z.string(),
})

const schema = z
  .object({
    title: z.string().min(1, 'Judul form wajib diisi'),
    description: z.string(),
    image: z.string(),
    meeting: z.string(),
    video: z.string(),
    qrisImage: z.string(),
    price: z.string(),
    isPublished: z.boolean(),
    fields: z.array(fieldSchema).min(1, 'Tambahkan minimal satu field'),
  })
  .superRefine((values, ctx) => {
    if (values.meeting.trim() && !/^https?:\/\/\S+$/.test(values.meeting.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['meeting'],
        message: 'Link acara harus diawali http:// atau https://',
      })
    }

    if (
      values.price.trim() &&
      !(Number(values.price.trim()) > 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'Harga harus berupa angka lebih dari 0, mis. 350000',
      })
    }

    if (values.video.trim() && !/^https?:\/\/\S+$/.test(values.video.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['video'],
        message: 'Link video harus diawali http:// atau https://',
      })
    }
  })

type FormValues = z.infer<typeof schema>

const emptyField = {
  id: '',
  label: '',
  description: '',
  placeholder: '',
  type: 'SHORT_TEXT',
  isRequired: false,
  optionText: '',
}

interface Props {
  formId?: string
  onEditFormsTitle?: (title: string) => void
}

export default function FormsCreate({ formId = '', onEditFormsTitle }: Props) {
  const router = useRouter()
  const { formsCreated, formsDetail, setGetFormsDetail } = useFormsStates()
  const { storeForms, updateForms } = useFormsControllers()

  const isEditing = !!formId

  const [filters, setFilters] = useState({
    optionError: '',
    activeTemplateId: '',
    loadedId: '',
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      image: '',
      meeting: '',
      video: '',
      qrisImage: '',
      price: '',
      isPublished: true,
      fields: [{ ...emptyField }],
    },
  })

  const { fields, append, remove, swap } = useFieldArray({
    control: form.control,
    name: 'fields',
  })

  const watchedTitle = form.watch('title')
  const watchedFields = form.watch('fields')
  const watchedPublished = form.watch('isPublished')
  const watchedBannerUrl = form.watch('image')
  const watchedQrisUrl = form.watch('qrisImage')
  const watchedFieldTypes = (form.watch('fields') ?? []).map((field) => field.type)

  const data = useMemo(() => {
    const getOptions = (optionText: string) =>
      optionText
        .split('\n')
        .map((option) => option.trim())
        .filter(Boolean)

    const getFieldError = (index: number) =>
      form.formState.errors.fields?.[index]?.label?.message ?? ''

    const getView = () => {
      const template = FORMS_TEMPLATES.find(
        (item) => item.id === filters.activeTemplateId
      )
      return template?.view ?? FORMS_TEMPLATE_DEFAULT_VIEW
    }

    const mappedList = (watchedFields ?? []).map((raw, index) => ({
      index,
      label: raw.label ?? '',
      description: raw.description ?? '',
      placeholder: raw.placeholder ?? '',
      type: (raw.type ?? 'SHORT_TEXT') as FormsFieldType,
      isRequired: raw.isRequired ?? false,
      optionText: raw.optionText ?? '',
      isOptionVisible: OPTION_TYPES.includes(raw.type as FormsFieldType),
      options: getOptions(raw.optionText ?? ''),
      labelError: getFieldError(index),
    }))

    return {
      data: mappedList,
      isLoading:
        storeForms.isPending ||
        updateForms.isPending ||
        formsCreated.status === 'loading',
      isError: formsCreated.status === 'error',
      isEmpty: !mappedList.length,
      emptyTitle: 'No Fields Yet',
      emptySubtitle: 'Tambahkan minimal satu pertanyaan untuk form ini.',
      emptyImage: '/no-data.svg',
      pagination: { currentPage: 1, perPage: mappedList.length },
      title: watchedTitle,
      titleError: form.formState.errors.title?.message ?? '',
      fieldsError: form.formState.errors.fields?.message ?? '',
      optionError: filters.optionError,
      activeTemplateId: filters.activeTemplateId,
      isPublished: watchedPublished,
      hasEventDetail: getView() === 'event',
      hasCourseDetail: getView() === 'course',
      hasPaymentDetail: PAID_VIEWS.includes(getView()),
      hasBanner: ['event', 'course', 'order', 'psychometric'].includes(
        getView()
      ),
      image: watchedBannerUrl,
      qrisImage: watchedQrisUrl,
      hasFixedPrice:
        PAID_VIEWS.includes(getView()) && !watchedFieldTypes.includes('MENU'),
      hasBudget: getView() === 'freelance',
      priceAmountError: form.formState.errors.price?.message ?? '',
      meetingUrlError: form.formState.errors.meeting?.message ?? '',
      videoUrlError: form.formState.errors.video?.message ?? '',
      totalFields: mappedList.length,
    }
  }, [
    watchedTitle,
    watchedFields,
    watchedPublished,
    watchedBannerUrl,
    watchedQrisUrl,
    watchedFieldTypes,
    form.formState.errors,
    storeForms.isPending,
    updateForms.isPending,
    formsCreated.status,
    filters.optionError,
    filters.activeTemplateId,
  ])

  const editFieldsItem = (index: number, patch: Record<string, unknown>) => {
    Object.entries(patch).forEach(([key, value]) => {
      form.setValue(
        `fields.${index}.${key}` as `fields.${number}.label`,
        value as never,
        { shouldValidate: false }
      )
    })
  }

  const loadFormsTemplate = (templateId: string) => {
    const getTemplate = (id: string) =>
      FORMS_TEMPLATES.find((item) => item.id === id)

    const template = getTemplate(templateId)
    if (!template) return

    const isOverwriting = form.formState.isDirty
    if (
      isOverwriting &&
      !window.confirm(
        'Isian yang sudah kamu tulis akan ditimpa oleh template ini. Lanjutkan?'
      )
    ) {
      return
    }

    form.reset({
      ...template.values,
    })
    setFilters((prev) => ({
      ...prev,
      optionError: '',
      activeTemplateId: templateId,
    }))

    if (router.query.template !== templateId) {
      router.replace(
        { pathname: router.pathname, query: { template: templateId } },
        undefined,
        { shallow: true }
      )
    }
  }

  const loadFieldsOrder = (index: number, direction: number) => {
    const target = index + direction
    if (target < 0 || target >= fields.length) return
    swap(index, target)
  }

  const clearFieldsItem = (index: number) => {
    remove(index)
  }

  const editBannerUrl = (url: string) => {
    form.setValue('image', url, { shouldDirty: true })
  }

  const editQrisUrl = (url: string) => {
    form.setValue('qrisImage', url, { shouldDirty: true })
  }

  const submitFormsField = () => {
    append({ ...emptyField })
  }

  const submitForms = form.handleSubmit((values) => {
    const getOptions = (optionText: string) =>
      optionText
        .split('\n')
        .map((option) => option.trim())
        .filter(Boolean)

    const invalidIndex = values.fields.findIndex(
      (field) =>
        OPTION_TYPES.includes(field.type as FormsFieldType) &&
        getOptions(field.optionText).length < 2
    )

    if (invalidIndex >= 0) {
      setFilters((prev) => ({
        ...prev,
        optionError: `Field ${invalidIndex + 1} butuh minimal 2 pilihan.`,
      }))
      return
    }

    const invalidMenuIndex = values.fields.findIndex(
      (field) =>
        field.type === 'MENU' &&
        getOptions(field.optionText).some(
          (option) => !Number(option.split('|')[1]?.trim())
        )
    )

    if (invalidMenuIndex >= 0) {
      setFilters((prev) => ({
        ...prev,
        optionError: `Field ${invalidMenuIndex + 1} butuh format Nama|Harga|URL Gambar dengan harga berupa angka.`,
      }))
      return
    }

    setFilters((prev) => ({ ...prev, optionError: '' }))

    const payload: PayloadPostForms = {
      title: values.title,
      description: values.description,
      templateId: filters.activeTemplateId,
      image: data.hasBanner ? values.image : '',
      meeting: data.hasEventDetail ? values.meeting.trim() : '',
      video: data.hasCourseDetail ? values.video.trim() : '',
      qrisImage: data.hasPaymentDetail ? values.qrisImage : '',
      price:
        data.hasFixedPrice || data.hasBudget
          ? Number(values.price.trim()) || 0
          : 0,
      isPublished: values.isPublished,
      fields: values.fields.map((field) => ({
        id: field.id || undefined,
        label: field.label,
        description: field.description,
        placeholder: field.placeholder,
        type: field.type as FormsFieldType,
        isRequired: field.isRequired,
        options: getOptions(field.optionText),
      })),
    }

    if (isEditing) return updateForms.mutate({ id: formId, ...payload })

    storeForms.mutate(payload)
  })

  useEffect(() => {
    onEditFormsTitle?.(watchedTitle)
  }, [watchedTitle, onEditFormsTitle])

  useEffect(() => {
    if (isEditing) return
    if (!router.isReady) return

    const templateId =
      typeof router.query.template === 'string' ? router.query.template : ''
    if (!templateId || templateId === filters.activeTemplateId) return

    const template = FORMS_TEMPLATES.find((item) => item.id === templateId)
    if (!template) return

    form.reset({
      ...template.values,
    })
    setFilters((prev) => ({
      ...prev,
      optionError: '',
      activeTemplateId: templateId,
    }))
  }, [isEditing, router.isReady, router.query.template, filters.activeTemplateId, form])

  useEffect(() => {
    if (formsCreated.status === 'success' && formsCreated.data?.id) {
      router.push(`/forms/${formsCreated.data.id}`)
    }
  }, [formsCreated.status, formsCreated.data, router])

  useEffect(() => {
    if (!isEditing) return
    setGetFormsDetail({ id: formId })
  }, [isEditing, formId, setGetFormsDetail])

  useEffect(() => {
    if (!isEditing) return

    const detail = formsDetail.data
    if (!detail || detail.id !== formId) return
    if (filters.loadedId === formId) return

    form.reset({
      title: detail.title,
      description: detail.description,
      image: detail.image,
      meeting: detail.meeting,
      video: detail.video,
      qrisImage: detail.qrisImage,
      price: detail.price ? String(detail.price) : '',
      isPublished: detail.isPublished,
      fields: detail.fields.map((field) => ({
        id: field.id,
        label: field.label,
        description: field.description,
        placeholder: field.placeholder,
        type: field.type,
        isRequired: field.isRequired,
        optionText: field.options.join('\n'),
      })),
    })

    setFilters((prev) => ({
      ...prev,
      loadedId: formId,
      activeTemplateId: detail.templateId,
    }))
  }, [isEditing, formId, formsDetail.data, filters.loadedId, form])

  return (
    <form
      id={FORMS_CREATE_FORM_ID}
      onSubmit={submitForms}
      className="border-2 border-foreground"
    >
      <SectionHead
        tag="SETUP"
        title={'Build\nthe form'}
        description={
          'Kasih judul, lalu susun pertanyaannya.\nBegitu jawaban masuk, peserta otomatis diberi skor dan diperingkat.'
        }
        className="bg-paper px-5 pt-6 sm:px-7"
      />

      <FormsTemplate
        activeId={data.activeTemplateId}
        onLoadFormsTemplate={loadFormsTemplate}
      />

      <div className="flex gap-4 border-b-2 border-foreground bg-paper px-5 py-6 sm:gap-6 sm:px-7">
        <span className="brutal-index">00</span>
        <div className="grid min-w-0 flex-1 gap-5">
          <div className="flex flex-col gap-3">
            <Label htmlFor="form-title">Form Title</Label>
            <Input
              id="form-title"
              placeholder="Ujian Tengah Semester — Sejarah Kelas XI"
              {...form.register('title')}
            />
            {data.titleError ? (
              <p className="brutal-eyebrow text-primary">{data.titleError}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="form-description">Intro Text</Label>
            <Textarea
              id="form-description"
              className="min-h-[80px]"
              placeholder="Penjelasan singkat yang dibaca responden sebelum mengisi"
              {...form.register('description')}
            />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="form-published"
              checked={data.isPublished}
              onCheckedChange={(checked) =>
                form.setValue('isPublished', checked === true)
              }
            />
            <Label htmlFor="form-published">Publish immediately</Label>
          </div>
        </div>
      </div>

      {data.hasBanner || data.hasPaymentDetail || data.hasBudget ? (
        <div className="flex gap-4 border-b-2 border-foreground bg-paper px-5 py-6 sm:gap-6 sm:px-7">
          <span className="brutal-index">
            {data.hasPaymentDetail ? (
              <Wallet className="h-5 w-5" />
            ) : (
              <CalendarDays className="h-5 w-5" />
            )}
          </span>
          <div className="grid min-w-0 flex-1 gap-5">
            {data.hasBanner ? (
              <div className="flex flex-col gap-3">
                <Label>Banner</Label>
                <UploadsBanner
                  value={data.image}
                  alt="Pratinjau banner form"
                  emptyLabel="UNGGAH BANNER"
                  onEditBanner={editBannerUrl}
                />
              </div>
            ) : null}

            {data.hasEventDetail ? (
              <div className="flex flex-col gap-3">
                <Label htmlFor="form-meeting-url">Link Google Meet</Label>
                <Input
                  id="form-meeting-url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  {...form.register('meeting')}
                />
                <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                  Link baru ditampilkan ke peserta setelah mereka berhasil
                  mendaftar, bukan di halaman pendaftaran.
                </p>
                {data.meetingUrlError ? (
                  <p className="brutal-eyebrow text-primary">
                    {data.meetingUrlError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {data.hasCourseDetail ? (
              <div className="flex flex-col gap-3">
                <Label htmlFor="form-video-url">Link Video Kelas</Label>
                <Input
                  id="form-video-url"
                  placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx"
                  {...form.register('video')}
                />
                <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                  Video baru terbuka setelah peserta memilih paket, membayar,
                  dan formulirnya terkirim. Tautan YouTube diputar langsung di
                  halaman, tautan lain dibuka di tab baru.
                </p>
                {data.videoUrlError ? (
                  <p className="brutal-eyebrow text-primary">
                    {data.videoUrlError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {data.hasBudget ? (
              <div className="flex flex-col gap-3">
                <Label htmlFor="form-budget-amount">Budget Proyek (Rp)</Label>
                <Input
                  id="form-budget-amount"
                  inputMode="numeric"
                  placeholder="4500000"
                  {...form.register('price')}
                />
                <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                  Tulis angka polos tanpa titik. Angka ini tampil sebagai budget
                  di papan proyek. Kosongkan kalau anggarannya masih terbuka
                  untuk dinegosiasi.
                </p>
                {data.priceAmountError ? (
                  <p className="brutal-eyebrow text-primary">
                    {data.priceAmountError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {data.hasFixedPrice ? (
              <div className="flex flex-col gap-3">
                <Label htmlFor="form-price-amount">Harga (Rp)</Label>
                <Input
                  id="form-price-amount"
                  inputMode="numeric"
                  placeholder="350000"
                  {...form.register('price')}
                />
                <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                  Tulis angka polos tanpa titik. Inilah tagihan yang dilihat
                  pengisi di field pembayaran.
                </p>
                {data.priceAmountError ? (
                  <p className="brutal-eyebrow text-primary">
                    {data.priceAmountError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {data.hasPaymentDetail ? (
              <div className="flex flex-col gap-3">
                <Label>Gambar QRIS</Label>
                <UploadsBanner
                  value={data.qrisImage}
                  alt="Pratinjau kode QRIS"
                  emptyLabel="UNGGAH QRIS"
                  onEditBanner={editQrisUrl}
                />
                <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                  Unggah kode QRIS milikmu dari penyedia pembayaran. Kode ini
                  yang dipindai pembayar saat memilih metode QRIS. Tanpa
                  gambar ini, metode QRIS tetap bisa dipilih tapi hanya
                  menampilkan petunjuknya.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}


      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-foreground bg-muted px-5 py-4 sm:px-7">
        <p className="brutal-eyebrow">
          QUESTIONS — {String(data.totalFields).padStart(2, '0')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={submitFormsField}
        >
          <Plus /> Add Field
        </Button>
      </div>

      {data.data.map((item) => (
        <FormsFieldEditor
          key={fields[item.index]?.id ?? item.index}
          index={item.index}
          total={data.totalFields}
          label={item.label}
          description={item.description}
          placeholder={item.placeholder}
          type={item.type}
          isRequired={item.isRequired}
          optionText={item.optionText}
          isOptionVisible={item.isOptionVisible}
          labelError={item.labelError}
          optionError={
            data.optionError.startsWith(`Field ${item.index + 1} `)
              ? data.optionError
              : ''
          }
          onEditFieldsItem={editFieldsItem}
          onLoadFieldsOrder={loadFieldsOrder}
          onClearFieldsItem={clearFieldsItem}
        />
      ))}

      {data.fieldsError ? (
        <p className="brutal-eyebrow border-b-2 border-foreground bg-primary px-7 py-4 text-primary-foreground">
          {data.fieldsError}
        </p>
      ) : null}

      {data.isError ? (
        <p className="brutal-eyebrow border-b-2 border-foreground bg-primary px-7 py-4 text-primary-foreground">
          {formsCreated.statusSubtitle}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-5 bg-paper px-5 py-7 sm:px-7">
        <Button type="submit" size="lg" disabled={data.isLoading}>
          {data.isLoading ? (
            <>
              <Loader2 className="animate-spin" /> Saving
            </>
          ) : (
            <>
              Save Form <ArrowRight />
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => router.push('/')}
        >
          <ArrowLeft /> Discard
        </Button>
      </div>
    </form>
  )
}
