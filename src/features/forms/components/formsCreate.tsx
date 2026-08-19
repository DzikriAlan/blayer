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
import { cn } from '@/shared/lib/utils'
import { IS_AI_VISIBLE } from '@/shared/lib/features'
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

/** Template yang halaman isinya memuat pembayaran. */
const PAID_VIEWS = ['order', 'course']

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
    bannerUrl: z.string(),
    meetingUrl: z.string(),
    videoUrl: z.string(),
    qrisUrl: z.string(),
    priceAmount: z.string(),
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

    // Link acara boleh kosong, tapi kalau diisi harus URL yang benar.
    if (values.meetingUrl.trim() && !/^https?:\/\/\S+$/.test(values.meetingUrl.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['meetingUrl'],
        message: 'Link acara harus diawali http:// atau https://',
      })
    }

    // Harga boleh kosong (form gratis atau bertagihan menu), tapi kalau diisi
    // harus angka positif — jika tidak, tagihannya tidak bisa dihitung.
    if (
      values.priceAmount.trim() &&
      !(Number(values.priceAmount.trim()) > 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['priceAmount'],
        message: 'Harga harus berupa angka lebih dari 0, mis. 350000',
      })
    }

    // Aturan yang sama berlaku untuk video kelas.
    if (values.videoUrl.trim() && !/^https?:\/\/\S+$/.test(values.videoUrl.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['videoUrl'],
        message: 'Link video harus diawali http:// atau https://',
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

interface Props {
  onEditFormsTitle?: (title: string) => void
}

export default function FormsCreate({ onEditFormsTitle }: Props) {
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
      bannerUrl: '',
      meetingUrl: '',
      videoUrl: '',
      qrisUrl: '',
      priceAmount: '',
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
  const watchedAiEnabled = form.watch('isAiEnabled')
  const watchedBannerUrl = form.watch('bannerUrl')
  const watchedQrisUrl = form.watch('qrisUrl')
  const watchedFieldTypes = (form.watch('fields') ?? []).map((field) => field.type)

  const data = useMemo(() => {
    const getOptions = (optionText: string) =>
      optionText
        .split('\n')
        .map((option) => option.trim())
        .filter(Boolean)

    const getFieldError = (index: number) =>
      form.formState.errors.fields?.[index]?.label?.message ?? ''

    // Bentuk builder mengikuti satu nilai view milik template.
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
      isLoading: storeForms.isPending || formsCreated.status === 'loading',
      isError: formsCreated.status === 'error',
      isEmpty: !mappedList.length,
      emptyTitle: 'No Fields Yet',
      emptySubtitle: 'Tambahkan minimal satu pertanyaan untuk form ini.',
      emptyImage: '/no-data.svg',
      pagination: { currentPage: 1, perPage: mappedList.length },
      title: watchedTitle,
      titleError: form.formState.errors.title?.message ?? '',
      purposeError: form.formState.errors.purpose?.message ?? '',
      fieldsError: form.formState.errors.fields?.message ?? '',
      optionError: filters.optionError,
      activeTemplateId: filters.activeTemplateId,
      isPublished: watchedPublished,
      isAiEnabled: watchedAiEnabled,
      hasEventDetail: getView() === 'event',
      hasCourseDetail: getView() === 'course',
      hasPaymentDetail: PAID_VIEWS.includes(getView()),
      // Banner dipakai sebagai poster acara, kelas, restoran, maupun logo
      // perusahaan yang membuka lowongan.
      hasBanner: ['event', 'course', 'order', 'psychometric'].includes(
        getView()
      ),
      bannerUrl: watchedBannerUrl,
      qrisUrl: watchedQrisUrl,
      // Harga tetap hanya relevan untuk form berbayar yang tidak punya menu:
      // kalau ada menu, tagihannya datang dari item yang dipilih pengisi.
      hasFixedPrice:
        PAID_VIEWS.includes(getView()) && !watchedFieldTypes.includes('MENU'),
      priceAmountError: form.formState.errors.priceAmount?.message ?? '',
      meetingUrlError: form.formState.errors.meetingUrl?.message ?? '',
      videoUrlError: form.formState.errors.videoUrl?.message ?? '',
      totalField: mappedList.length,
    }
  }, [
    watchedTitle,
    watchedFields,
    watchedPublished,
    watchedAiEnabled,
    watchedBannerUrl,
    watchedQrisUrl,
    watchedFieldTypes,
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

    // URL ikut menyebut template yang sedang dipakai. Tanpa ini, efek pembaca
    // ?template= melihat nilai lama dan langsung menarik isian kembali ke
    // template sebelumnya — jadi template lain tidak pernah bisa dipilih.
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
    form.setValue('bannerUrl', url, { shouldDirty: true })
  }

  const editQrisUrl = (url: string) => {
    form.setValue('qrisUrl', url, { shouldDirty: true })
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

    // Menu tanpa harga membuat tagihan tidak bisa dihitung, jadi ditolak di sini.
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
      // Kirim kosong saat AI dimatikan supaya server menyimpannya sebagai null.
      purpose: values.isAiEnabled ? values.purpose.trim() : '',
      templateId: filters.activeTemplateId,
      // Detail tambahan hanya ikut terkirim kalau templatenya memang memakainya.
      bannerUrl: data.hasBanner ? values.bannerUrl : '',
      meetingUrl: data.hasEventDetail ? values.meetingUrl.trim() : '',
      videoUrl: data.hasCourseDetail ? values.videoUrl.trim() : '',
      qrisUrl: data.hasPaymentDetail ? values.qrisUrl : '',
      priceAmount: data.hasFixedPrice ? Number(values.priceAmount.trim()) || 0 : 0,
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

  useEffect(() => {
    onEditFormsTitle?.(watchedTitle)
  }, [watchedTitle, onEditFormsTitle])

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

      {data.hasBanner || data.hasPaymentDetail ? (
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
                  value={data.bannerUrl}
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
                  {...form.register('meetingUrl')}
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
                  {...form.register('videoUrl')}
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

            {data.hasFixedPrice ? (
              <div className="flex flex-col gap-3">
                <Label htmlFor="form-price-amount">Harga (Rp)</Label>
                <Input
                  id="form-price-amount"
                  inputMode="numeric"
                  placeholder="350000"
                  {...form.register('priceAmount')}
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
                  value={data.qrisUrl}
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
