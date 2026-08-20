'use client'

import Image from 'next/image'
import { Minus, Plus, QrCode } from 'lucide-react'

import type { DataFormsDetailField } from '@/features/forms/types/formsTypes'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const INPUT_TYPES: Partial<Record<DataFormsDetailField['type'], string>> = {
  SHORT_TEXT: 'text',
  NUMBER: 'number',
  EMAIL: 'email',
  PHONE: 'tel',
  URL: 'url',
  DATE: 'date',
  TIME: 'time',
}

const RATING_VALUES = [1, 2, 3, 4, 5]
const SCALE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/** Jumlah porsi ditulis di belakang nama, mis. "Nasi Goreng x2". */
const MENU_QTY_PATTERN = / x(\d+)$/

interface Props {
  index: number
  field: DataFormsDetailField
  value: string | string[]
  error: string
  /** Tagihan berjalan, dipakai field pembayaran untuk menampilkan totalnya. */
  amount?: number
  /** Gambar QRIS milik pembuat form; kosong berarti belum diunggah. */
  qrisUrl?: string
  onEditAnswer: (fieldId: string, value: string | string[]) => void
}

export default function ResponsesField({
  index,
  field,
  value,
  error,
  amount = 0,
  qrisUrl = '',
  onEditAnswer,
}: Props) {
  const getCheckedList = () => (Array.isArray(value) ? value : [])

  const getTextValue = () => (Array.isArray(value) ? '' : value)

  const getIndexLabel = () => String(index + 1).padStart(2, '0')

  // Baris opsi menu: "Nama|Harga|URL Gambar"; dua bagian terakhir opsional.
  const getMenuItem = (option: string) => {
    const [name, price, imageUrl] = option.split('|')
    return {
      name: (name ?? '').trim(),
      price: Number((price ?? '').trim()) || 0,
      imageUrl: (imageUrl ?? '').trim(),
    }
  }

  const getMenuQty = (name: string) => {
    const entry = getCheckedList().find(
      (item) => item.replace(MENU_QTY_PATTERN, '') === name
    )
    if (!entry) return 0
    return Number(entry.match(MENU_QTY_PATTERN)?.[1] ?? 1)
  }

  const getCurrencyText = (value: number) => `Rp${value.toLocaleString('id-ID')}`

  // Baris opsi pembayaran: "Metode|Petunjuk".
  const getPaymentItem = (option: string) => {
    const [method, guide] = option.split('|')
    return { method: (method ?? '').trim(), guide: (guide ?? '').trim() }
  }

  const editCheckbox = (option: string, checked: boolean) => {
    const current = getCheckedList()
    const next = checked
      ? [...current, option]
      : current.filter((item) => item !== option)
    onEditAnswer(field.id, next)
  }

  const editMenuQty = (name: string, delta: number) => {
    const getNextEntry = (qty: number) => (qty > 1 ? `${name} x${qty}` : name)

    const current = getCheckedList()
    const others = current.filter(
      (item) => item.replace(MENU_QTY_PATTERN, '') !== name
    )
    const nextQty = Math.max(getMenuQty(name) + delta, 0)

    onEditAnswer(field.id, nextQty ? [...others, getNextEntry(nextQty)] : others)
  }

  const renderMenu = () => {
    const items = field.options.map(getMenuItem).filter((item) => item.name)
    const subtotal = items.reduce(
      (total, item) => total + item.price * getMenuQty(item.name),
      0
    )

    return (
      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const qty = getMenuQty(item.name)
            return (
              <div
                key={item.name}
                className={cn(
                  'border-2 border-foreground transition-colors',
                  qty ? 'bg-primary text-primary-foreground' : 'bg-paper'
                )}
              >
                {item.imageUrl ? (
                  <button
                    type="button"
                    aria-label={`Tambah ${item.name}`}
                    onClick={() => editMenuQty(item.name, 1)}
                    className="block w-full border-b-2 border-foreground bg-muted"
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={0}
                      height={0}
                      unoptimized
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="h-40 w-full object-cover"
                    />
                  </button>
                ) : null}

                <div className="flex flex-col gap-3 px-4 py-4">
                  <p className="break-words font-display text-base font-black uppercase leading-tight tracking-tight">
                    {item.name}
                  </p>
                  <p className="brutal-eyebrow opacity-80">
                    {getCurrencyText(item.price)}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="paper"
                        size="icon"
                        className="h-8 w-9"
                        aria-label={`Kurangi ${item.name}`}
                        disabled={!qty}
                        onClick={() => editMenuQty(item.name, -1)}
                      >
                        <Minus />
                      </Button>
                      <span className="brutal-eyebrow w-7 text-center">
                        {String(qty).padStart(2, '0')}
                      </span>
                      <Button
                        type="button"
                        variant="paper"
                        size="icon"
                        className="h-8 w-9"
                        aria-label={`Tambah ${item.name}`}
                        onClick={() => editMenuQty(item.name, 1)}
                      >
                        <Plus />
                      </Button>
                    </div>
                    <span className="brutal-eyebrow shrink-0">
                      {qty ? getCurrencyText(item.price * qty) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-2 border-foreground bg-foreground px-4 py-3 text-background">
          <span className="brutal-eyebrow opacity-70">SUBTOTAL</span>
          <span className="font-display text-xl font-black leading-none">
            {getCurrencyText(subtotal)}
          </span>
        </div>
      </div>
    )
  }

  const renderPayment = () => {
    const methods = field.options.map(getPaymentItem).filter((item) => item.method)
    const selected = getTextValue()
    const isQris = selected.toLowerCase().includes('qris')
    const guide = methods.find((item) => item.method === selected)?.guide ?? ''

    return (
      <div>
        <div className="flex items-center justify-between gap-3 border-2 border-foreground bg-primary px-4 py-4 text-primary-foreground">
          <span className="brutal-eyebrow">TOTAL TAGIHAN</span>
          <span className="font-display text-2xl font-black leading-none">
            {getCurrencyText(amount)}
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {methods.map((item) => (
            <button
              key={item.method}
              type="button"
              onClick={() => onEditAnswer(field.id, item.method)}
              className={cn(
                'border-2 border-foreground px-4 py-3 text-left transition-colors',
                selected === item.method
                  ? 'bg-foreground text-background'
                  : 'bg-paper hover:bg-muted'
              )}
            >
              <span className="brutal-eyebrow">{item.method}</span>
              {item.guide ? (
                <span className="mt-1.5 block font-mono text-xs leading-relaxed opacity-80">
                  {item.guide}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {selected ? (
          <div className="mt-4 border-2 border-foreground bg-muted px-4 py-4">
            <p className="brutal-eyebrow flex items-center gap-2">
              <QrCode className="h-3.5 w-3.5" /> {selected}
            </p>

            {isQris && qrisUrl ? (
              <div className="mt-4 max-w-[260px] border-2 border-foreground bg-paper">
                <Image
                  src={qrisUrl}
                  alt="Kode QRIS pembayaran"
                  width={0}
                  height={0}
                  unoptimized
                  sizes="260px"
                  className="h-auto w-full"
                />
              </div>
            ) : null}

            {isQris && !qrisUrl ? (
              <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
                Pembuat form belum mengunggah kode QRIS. Tanyakan kodenya ke
                petugas, atau pilih metode pembayaran lain.
              </p>
            ) : null}

            <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
              {guide ||
                'Selesaikan pembayaran sesuai metode ini, lalu kirim formulirnya.'}
            </p>
            <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
              Pembayaran belum diverifikasi otomatis — petugas mengonfirmasinya
              dari daftar pesanan.
            </p>
          </div>
        ) : null}
      </div>
    )
  }

  const renderControl = () => {
    if (field.type === 'MENU') return renderMenu()

    if (field.type === 'PAYMENT') return renderPayment()

    if (field.type === 'LONG_TEXT') {
      return (
        <Textarea
          id={field.id}
          value={getTextValue()}
          placeholder={field.placeholder || 'Type your answer'}
          onChange={(event) => onEditAnswer(field.id, event.target.value)}
        />
      )
    }

    if (field.type === 'SELECT') {
      return (
        <Select
          value={getTextValue()}
          onValueChange={(next) => onEditAnswer(field.id, next)}
        >
          <SelectTrigger id={field.id}>
            <SelectValue placeholder={field.placeholder || 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field.type === 'RADIO') {
      return (
        <RadioGroup
          value={getTextValue()}
          onValueChange={(next) => onEditAnswer(field.id, next)}
        >
          {field.options.map((option) => (
            <div key={option} className="flex items-center gap-3">
              <RadioGroupItem value={option} id={`${field.id}-${option}`} />
              <Label
                htmlFor={`${field.id}-${option}`}
                className="font-mono text-sm font-normal normal-case tracking-normal"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
    }

    if (field.type === 'CHECKBOX') {
      return (
        <div className="grid gap-3">
          {field.options.map((option) => (
            <div key={option} className="flex items-center gap-3">
              <Checkbox
                id={`${field.id}-${option}`}
                checked={getCheckedList().includes(option)}
                onCheckedChange={(checked) =>
                  editCheckbox(option, checked === true)
                }
              />
              <Label
                htmlFor={`${field.id}-${option}`}
                className="font-mono text-sm font-normal normal-case tracking-normal"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      )
    }

    // Grid (bukan flex) supaya skala tetap terbaca saat dibungkus di layar kecil.
    // Garis kotak dibentuk dari border tiap sel, jadi aman berapa pun barisnya.
    if (field.type === 'RATING') {
      return (
        <div className="grid grid-cols-5 border-l-2 border-t-2 border-foreground">
          {RATING_VALUES.map((rating) => (
            <button
              key={rating}
              type="button"
              aria-label={`Beri nilai ${rating} dari 5`}
              onClick={() => onEditAnswer(field.id, String(rating))}
              className={cn(
                'h-12 border-b-2 border-r-2 border-foreground text-lg leading-none transition-colors',
                Number(getTextValue()) >= rating
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-paper hover:bg-muted'
              )}
            >
              ★
            </button>
          ))}
        </div>
      )
    }

    if (field.type === 'SCALE') {
      return (
        <div className="grid grid-cols-5 border-l-2 border-t-2 border-foreground sm:grid-cols-10">
          {SCALE_VALUES.map((scale) => (
            <button
              key={scale}
              type="button"
              aria-label={`Pilih nilai ${scale} dari 10`}
              onClick={() => onEditAnswer(field.id, String(scale))}
              className={cn(
                'h-12 border-b-2 border-r-2 border-foreground font-mono text-sm font-bold transition-colors',
                getTextValue() === String(scale)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-paper hover:bg-muted'
              )}
            >
              {scale}
            </button>
          ))}
        </div>
      )
    }

    return (
      <Input
        id={field.id}
        type={INPUT_TYPES[field.type] ?? 'text'}
        value={getTextValue()}
        placeholder={field.placeholder || 'Type your answer'}
        onChange={(event) => onEditAnswer(field.id, event.target.value)}
      />
    )
  }

  return (
    <div className="flex gap-4 border-b-2 border-foreground bg-paper px-5 py-6 sm:gap-6 sm:px-7">
      <span className="brutal-index">{getIndexLabel()}</span>

      <div className="min-w-0 flex-1">
        <Label htmlFor={field.id} className="text-[13px]">
          {field.label}
          {field.isRequired ? (
            <span className="ml-1.5 text-primary">*</span>
          ) : null}
        </Label>

        {field.description ? (
          <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
            {field.description}
          </p>
        ) : null}

        <div className="mt-4">{renderControl()}</div>

        {error ? (
          <p className="brutal-eyebrow mt-3 text-primary">{error}</p>
        ) : null}
      </div>
    </div>
  )
}
