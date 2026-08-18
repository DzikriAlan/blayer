'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Loader2, Plus } from 'lucide-react'

import type { FormsFieldType, PayloadPostForms } from '../types/formsTypes'
import { useFormsStates } from '../states/formsStates'
import { useFormsControllers } from '../controllers/formsControllers'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import SectionHead from '@/components/section-head'
import { cn } from '@/shared/lib/utils'
import { IS_AI_VISIBLE } from '@/shared/lib/features'
import FormsFieldEditor from './formsFieldEditor'
import FormsTemplate, { FORMS_TEMPLATES } from './formsTemplate'

export const FORMS_CREATE_FORM_ID = 'forms-create'

const OPTION_TYPES: FormsFieldType[] = ['SELECT', 'RADIO', 'CHECKBOX']

const fieldSchema = z.object({
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
    isAiEnabled: z.boolean(),
    purpose: z.string(),
    isPublished: z.boolean(),
    fields: z.array(fieldSchema).min(1, 'Tambahkan minimal satu field'),
  })
  // Tujuan hanya wajib kalau analisis AI dinyalakan.
  .superRefine((values, ctx) => {
    if (values.isAiEnabled && values.purpose.trim().length < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['purpose'],
        message:
          'Jelaskan tujuan minimal 20 karakter agar AI paham konteksnya',
      })
    }
  })

type FormValues = z.infer<typeof schema>

const emptyField = {
  label: '',
  description: '',
  placeholder: '',
  type: 'SHORT_TEXT',
  isRequired: false,
  optionText: '',
}

export default function FormsCreate() {
  const router = useRouter()
  const { formsCreated } = useFormsStates()
  const { storeForms } = useFormsControllers()

  const [filters, setFilters] = useState({
    optionError: '',
    activeTemplateId: '',
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      isAiEnabled: IS_AI_VISIBLE,
      purpose: '',
      isPublished: true,
      fields: [{ ...emptyField }],
    },
  })

  const { fields, append, remove, swap } = useFieldArray({
    control: form.control,
    name: 'fields',
  })

  const watchedFields = form.watch('fields')
  const watchedPublished = form.watch('isPublished')
  const watchedAiEnabled = form.watch('isAiEnabled')

  const data = useMemo(() => {
    const getOptions = (optionText: string) =>
      optionText
        .split('\n')
        .map((option) => option.trim())
        .filter(Boolean)

    const getFieldError = (index: number) =>
      form.formState.errors.fields?.[index]?.label?.message ?? ''

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
      isLoading: storeForms.isPending || formsCreated.status === 'loading',
      isError: formsCreated.status === 'error',
      isEmpty: !mappedList.length,
      emptyTitle: 'No Fields Yet',
      emptySubtitle: 'Tambahkan minimal satu pertanyaan untuk form ini.',
      emptyImage: '/no-data.svg',
      pagination: { currentPage: 1, perPage: mappedList.length },
      titleError: form.formState.errors.title?.message ?? '',
      purposeError: form.formState.errors.purpose?.message ?? '',
      fieldsError: form.formState.errors.fields?.message ?? '',
      optionError: filters.optionError,
      activeTemplateId: filters.activeTemplateId,
      isPublished: watchedPublished,
      isAiEnabled: watchedAiEnabled,
      totalField: mappedList.length,
    }
  }, [
    watchedFields,
    watchedPublished,
    watchedAiEnabled,
    form.formState.errors,
    storeForms.isPending,
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

    // Template menimpa seluruh isian — konfirmasi dulu kalau sudah ada yang ditulis.
    const isOverwriting = form.formState.isDirty
    if (
      isOverwriting &&
      !window.confirm(
        'Isian yang sudah kamu tulis akan ditimpa oleh template ini. Lanjutkan?'
      )
    ) {
      return
    }

    // Saat UI AI disembunyikan, tujuan AI tidak boleh ikut aktif dari template
    // — kalau tidak, validasinya wajib tapi kolomnya tidak terlihat.
    form.reset({
      ...template.values,
      isAiEnabled: IS_AI_VISIBLE && template.values.isAiEnabled,
    })
    setFilters((prev) => ({
      ...prev,
      optionError: '',
      activeTemplateId: templateId,
    }))
  }

  const loadFieldsOrder = (index: number, direction: number) => {
    const target = index + direction
    if (target < 0 || target >= fields.length) return
    swap(index, target)
  }

  const clearFieldsItem = (index: number) => {
    remove(index)
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

    setFilters((prev) => ({ ...prev, optionError: '' }))

    const payload: PayloadPostForms = {
      title: values.title,
      description: values.description,
      // Kirim kosong saat AI dimatikan supaya server menyimpannya sebagai null.
      purpose: values.isAiEnabled ? values.purpose.trim() : '',
      templateId: filters.activeTemplateId,
      isPublished: values.isPublished,
      fields: values.fields.map((field) => ({
        label: field.label,
        description: field.description,
        placeholder: field.placeholder,
        type: field.type as FormsFieldType,
        isRequired: field.isRequired,
        options: getOptions(field.optionText),
      })),
    }

    storeForms.mutate(payload)
  })

  // Template yang dipilih dari beranda datang lewat ?template=<id>.
  useEffect(() => {
    if (!router.isReady) return

    const templateId =
      typeof router.query.template === 'string' ? router.query.template : ''
    if (!templateId || templateId === filters.activeTemplateId) return

    const template = FORMS_TEMPLATES.find((item) => item.id === templateId)
    if (!template) return

    // Saat UI AI disembunyikan, tujuan AI tidak boleh ikut aktif dari template
    // — kalau tidak, validasinya wajib tapi kolomnya tidak terlihat.
    form.reset({
      ...template.values,
      isAiEnabled: IS_AI_VISIBLE && template.values.isAiEnabled,
    })
    setFilters((prev) => ({
      ...prev,
      optionError: '',
      activeTemplateId: templateId,
    }))
  }, [router.isReady, router.query.template, filters.activeTemplateId, form])

  useEffect(() => {
    if (formsCreated.status === 'success' && formsCreated.data?.id) {
      router.push(`/forms/${formsCreated.data.id}`)
    }
  }, [formsCreated.status, formsCreated.data, router])

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

      {IS_AI_VISIBLE ? (
      <div
        className={cn(
          'border-b-2 border-foreground px-5 py-7 sm:px-7',
          data.isAiEnabled
            ? 'bg-primary text-primary-foreground'
            : 'bg-paper text-foreground'
        )}
      >
        <div className="flex items-stretch gap-3">
          <span
            className={cn(
              'brutal-eyebrow px-3 py-2',
              data.isAiEnabled
                ? 'bg-foreground text-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            AI TARGET — {data.isAiEnabled ? 'ON' : 'OFF'}
          </span>
          <span
            aria-hidden
            className={cn(
              'brutal-hatch flex-1',
              data.isAiEnabled ? 'opacity-40' : 'opacity-15'
            )}
          />
        </div>

        <h2 className="mt-5 font-display text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">
          What should AI decide
          <span className={data.isAiEnabled ? 'text-foreground' : 'text-primary'}>
            ?
          </span>
        </h2>

        <div className="mt-6 flex items-center gap-3">
          <Checkbox
            id="form-ai-enabled"
            checked={data.isAiEnabled}
            onCheckedChange={(checked) =>
              form.setValue('isAiEnabled', checked === true)
            }
          />
          <Label htmlFor="form-ai-enabled">Aktifkan analisis AI</Label>
        </div>

        {data.isAiEnabled ? (
          <div className="mt-6">
            <Textarea
              id="form-purpose"
              className="min-h-[130px] border-foreground bg-paper text-foreground"
              placeholder="Contoh: Ujian tengah semester Sejarah kelas XI. Nilai pemahaman siswa terhadap materi, ketepatan jawaban pilihan ganda, dan kedalaman argumen pada jawaban esai. Urutkan siswa dari nilai tertinggi dan sebutkan siapa yang perlu remedial beserta topik yang belum dikuasai."
              {...form.register('purpose')}
            />
            <p className="mt-3 font-mono text-xs leading-relaxed">
              Semakin jelas tujuannya, semakin tajam peringkat dan rekomendasi
              yang dihasilkan AI.
            </p>
            {data.purposeError ? (
              <p className="brutal-eyebrow mt-3 bg-foreground px-3 py-2 text-primary">
                {data.purposeError}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 max-w-xl font-mono text-xs leading-relaxed text-muted-foreground">
            Form tetap bisa diisi dan semua jawaban tersimpan seperti biasa —
            kamu hanya tidak mendapat peringkat dan rekomendasi otomatis. Semua
            jawaban mentah tetap bisa dilihat di halaman hasil.
          </p>
        )}
      </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-foreground bg-muted px-5 py-4 sm:px-7">
        <p className="brutal-eyebrow">
          QUESTIONS — {String(data.totalField).padStart(2, '0')}
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
          total={data.totalField}
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
