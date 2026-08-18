'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'

import type { DataUploadsBanner } from '../types/uploadsTypes'
import { useUploadsStates } from '../states/uploadsStates'
import { useUploadsControllers } from '../controllers/uploadsControllers'

import { Button } from '@/components/ui/button'

const MAX_BYTE = 4 * 1024 * 1024

interface Props {
  value: string
  /** Teks alternatif pratinjau; dibedakan karena unggahan tidak selalu banner. */
  alt?: string
  /** Label tombol saat belum ada gambar. */
  emptyLabel?: string
  onEditBanner: (url: string) => void
}

export default function UploadsBanner({
  value,
  alt = 'Pratinjau banner acara',
  emptyLabel = 'UNGGAH BANNER',
  onEditBanner,
}: Props) {
  const { uploadsBanner } = useUploadsStates()
  const { storeUploadsBanner } = useUploadsControllers()

  const inputRef = useRef<HTMLInputElement>(null)

  const [filters, setFilters] = useState({
    localError: '',
  })

  const data = useMemo(() => {
    const getUploadError = () =>
      uploadsBanner.status === 'error'
        ? uploadsBanner.statusSubtitle ||
          'Banner gagal diunggah. Coba lagi atau pakai gambar lain.'
        : ''

    return {
      data: [] as DataUploadsBanner[],
      isLoading: storeUploadsBanner.isPending,
      isError: uploadsBanner.status === 'error',
      isEmpty: !value,
      emptyTitle: 'Belum Ada Banner',
      emptySubtitle: 'JPG, PNG, WEBP, GIF, atau AVIF. Maksimal 4 MB.',
      emptyImage: '/no-data.svg',
      pagination: { currentPage: 1, perPage: 1 },
      previewUrl: value,
      previewAlt: alt,
      emptyLabel,
      errorText: filters.localError || getUploadError(),
    }
  }, [
    value,
    alt,
    emptyLabel,
    filters.localError,
    uploadsBanner.status,
    uploadsBanner.statusSubtitle,
    storeUploadsBanner.isPending,
  ])

  const editBanner = (file: File | undefined) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFilters((prev) => ({ ...prev, localError: 'Berkas harus gambar.' }))
      return
    }

    if (file.size > MAX_BYTE) {
      setFilters((prev) => ({
        ...prev,
        localError: 'Ukuran gambar maksimal 4 MB.',
      }))
      return
    }

    setFilters((prev) => ({ ...prev, localError: '' }))

    const reader = new FileReader()
    reader.onload = () => {
      const getBase64 = () => String(reader.result ?? '')

      storeUploadsBanner.mutate(
        {
          fileName: file.name,
          contentType: file.type,
          fileBase64: getBase64(),
        },
        {
          onSuccess: (uploaded) => {
            if (uploaded?.url) onEditBanner(uploaded.url)
          },
        }
      )
    }
    reader.readAsDataURL(file)
  }

  const clearBanner = () => {
    setFilters((prev) => ({ ...prev, localError: '' }))
    if (inputRef.current) inputRef.current.value = ''
    onEditBanner('')
  }

  const loadBannerPicker = () => {
    inputRef.current?.click()
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => editBanner(event.target.files?.[0])}
      />

      {data.isEmpty ? (
        <button
          type="button"
          onClick={loadBannerPicker}
          disabled={data.isLoading}
          className="flex min-h-[150px] w-full flex-col items-center justify-center gap-3 border-2 border-dashed border-foreground bg-muted px-5 py-8 transition-colors hover:bg-paper disabled:opacity-60"
        >
          {data.isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <ImagePlus className="h-6 w-6" />
          )}
          <span className="brutal-eyebrow">
            {data.isLoading ? 'MENGUNGGAH' : data.emptyLabel}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {data.emptySubtitle}
          </span>
        </button>
      ) : (
        <div className="border-2 border-foreground">
          <div className="bg-muted">
            <Image
              src={data.previewUrl}
              alt={data.previewAlt}
              width={0}
              height={0}
              unoptimized
              sizes="(max-width: 768px) 100vw, 640px"
              className="h-auto w-full"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t-2 border-foreground bg-paper px-4 py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={data.isLoading}
              onClick={loadBannerPicker}
            >
              {data.isLoading ? (
                <>
                  <Loader2 className="animate-spin" /> Mengunggah
                </>
              ) : (
                <>
                  <ImagePlus /> Ganti
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={clearBanner}
            >
              <Trash2 /> Hapus
            </Button>
          </div>
        </div>
      )}

      {data.errorText ? (
        <p className="brutal-eyebrow text-primary">{data.errorText}</p>
      ) : null}
    </div>
  )
}
