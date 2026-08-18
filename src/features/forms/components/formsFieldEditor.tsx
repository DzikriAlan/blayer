'use client'

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'

import type { FormsFieldType } from '../types/formsTypes'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export const FORMS_FIELD_TYPES: { value: FormsFieldType; label: string }[] = [
  { value: 'SHORT_TEXT', label: 'Jawaban Singkat' },
  { value: 'LONG_TEXT', label: 'Paragraf' },
  { value: 'NUMBER', label: 'Angka' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Nomor Telepon' },
  { value: 'URL', label: 'Tautan (URL)' },
  { value: 'DATE', label: 'Tanggal' },
  { value: 'TIME', label: 'Waktu' },
  { value: 'SELECT', label: 'Dropdown' },
  { value: 'RADIO', label: 'Pilihan Ganda' },
  { value: 'CHECKBOX', label: 'Kotak Centang' },
  { value: 'RATING', label: 'Rating Bintang (1-5)' },
  { value: 'SCALE', label: 'Skala Linier (1-10)' },
]

interface Props {
  index: number
  total: number
  label: string
  description: string
  placeholder: string
  type: FormsFieldType
  isRequired: boolean
  optionText: string
  isOptionVisible: boolean
  labelError: string
  optionError: string
  onEditFieldsItem: (index: number, patch: Record<string, unknown>) => void
  onLoadFieldsOrder: (index: number, direction: number) => void
  onClearFieldsItem: (index: number) => void
}

export default function FormsFieldEditor({
  index,
  total,
  label,
  description,
  placeholder,
  type,
  isRequired,
  optionText,
  isOptionVisible,
  labelError,
  optionError,
  onEditFieldsItem,
  onLoadFieldsOrder,
  onClearFieldsItem,
}: Props) {
  return (
    <div className="flex gap-4 border-b-2 border-foreground bg-paper px-5 py-6 sm:gap-6 sm:px-7">
      <span className="brutal-index">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="grid min-w-0 flex-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-3 sm:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <Label htmlFor={`field-label-${index}`}>Question</Label>

            {/* Reorder + delete. Arrows sit side by side so the pair never
                reads as a select control. */}
            <div className="flex items-center">
              <Button
                type="button"
                variant="paper"
                size="icon"
                className="h-8 w-9"
                title="Pindah ke atas"
                aria-label="Pindahkan field ke atas"
                disabled={index === 0}
                onClick={() => onLoadFieldsOrder(index, -1)}
              >
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="paper"
                size="icon"
                className="-ml-0.5 h-8 w-9"
                title="Pindah ke bawah"
                aria-label="Pindahkan field ke bawah"
                disabled={index === total - 1}
                onClick={() => onLoadFieldsOrder(index, 1)}
              >
                <ArrowDown />
              </Button>
              <Button
                type="button"
                variant="paper"
                size="icon"
                className="ml-2.5 h-8 w-9 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                title="Hapus field"
                aria-label="Hapus field"
                onClick={() => onClearFieldsItem(index)}
              >
                <Trash2 />
              </Button>
            </div>
          </div>

          <Input
            id={`field-label-${index}`}
            value={label}
            placeholder="Type your question"
            onChange={(event) =>
              onEditFieldsItem(index, { label: event.target.value })
            }
          />
          {labelError ? (
            <p className="brutal-eyebrow text-primary">{labelError}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor={`field-type-${index}`}>Answer Type</Label>
          <Select
            value={type}
            onValueChange={(value) => onEditFieldsItem(index, { type: value })}
          >
            <SelectTrigger id={`field-type-${index}`}>
              <SelectValue placeholder="Pilih tipe" />
            </SelectTrigger>
            <SelectContent>
              {FORMS_FIELD_TYPES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-3 pb-2.5">
          <Checkbox
            id={`field-required-${index}`}
            checked={isRequired}
            onCheckedChange={(checked) =>
              onEditFieldsItem(index, { isRequired: checked === true })
            }
          />
          <Label htmlFor={`field-required-${index}`}>
            Required <span className="text-primary">*</span>
          </Label>
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor={`field-description-${index}`}>Helper Text</Label>
          <Input
            id={`field-description-${index}`}
            variant="boxed"
            value={description}
            placeholder="Optional"
            onChange={(event) =>
              onEditFieldsItem(index, { description: event.target.value })
            }
          />
        </div>

        <div className="flex flex-col gap-3">
          <Label htmlFor={`field-placeholder-${index}`}>Placeholder</Label>
          <Input
            id={`field-placeholder-${index}`}
            variant="boxed"
            value={placeholder}
            placeholder="Optional"
            onChange={(event) =>
              onEditFieldsItem(index, { placeholder: event.target.value })
            }
          />
        </div>

        {isOptionVisible ? (
          <div className="flex flex-col gap-3 sm:col-span-2">
            <Label htmlFor={`field-options-${index}`}>
              Options — one per line
            </Label>
            <Textarea
              id={`field-options-${index}`}
              value={optionText}
              placeholder={'Feedback\nCollaboration\nSupport\nOther'}
              onChange={(event) =>
                onEditFieldsItem(index, { optionText: event.target.value })
              }
            />
            {optionError ? (
              <p className="brutal-eyebrow text-primary">{optionError}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
