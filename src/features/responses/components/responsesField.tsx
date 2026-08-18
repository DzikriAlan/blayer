'use client'

import type { DataFormsDetailField } from '@/features/forms/types/formsTypes'

import { cn } from '@/shared/lib/utils'
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

interface Props {
  index: number
  field: DataFormsDetailField
  value: string | string[]
  error: string
  onEditAnswer: (fieldId: string, value: string | string[]) => void
}

export default function ResponsesField({
  index,
  field,
  value,
  error,
  onEditAnswer,
}: Props) {
  const getCheckedList = () => (Array.isArray(value) ? value : [])

  const getTextValue = () => (Array.isArray(value) ? '' : value)

  const getIndexLabel = () => String(index + 1).padStart(2, '0')

  const editCheckbox = (option: string, checked: boolean) => {
    const current = getCheckedList()
    const next = checked
      ? [...current, option]
      : current.filter((item) => item !== option)
    onEditAnswer(field.id, next)
  }

  const renderControl = () => {
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
