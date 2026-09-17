'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImageIcon, Eye, Info, Copy, Check as CheckIcon, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { getSupabaseClient, isSupabaseConfigured, STORAGE_BUCKET } from '@/shared/lib/supabase'
import type { DataAgent } from '../types/agentTypes'

export type AgentPrefillData = {
  name?: string
  description?: string
  personalization?: string
}

export const agentSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  description: z.string(),
  image: z.string(),
  personalization: z.string(),
  isDefault: z.boolean(),
})

export type AgentFormValues = z.infer<typeof agentSchema>

export interface AgentFormHandle {
  triggerPreview: () => void
}

interface Props {
  agent: DataAgent | null
  isSaving: boolean
  prefillData?: AgentPrefillData
  onSave: (d: { name: string; description: string; image: string; personalization: string; isDefault: boolean }) => void
  onPreview: (a: DataAgent) => void
  onGenerateClick?: () => void
}

const AgentForm = forwardRef<AgentFormHandle, Props>(function AgentForm(
  { agent, isSaving, prefillData, onSave, onPreview, onGenerateClick }: Readonly<Props>,
  ref,
) {
  // states / variable
  const isEdit = agent != null
  const [imagePreview, setImagePreview] = useState(agent?.image ?? '')
  const [embedCopied, setEmbedCopied] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [imageBoxSize, setImageBoxSize] = useState(160)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const rightColRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: { name: '', description: '', image: '', personalization: '', isDefault: false },
  })
  const formValues = watch()

  // function / methode
  const getEmbedScript = () => {
    const baseUrl = globalThis.window?.location.origin ?? ''
    const id = agent?.id ?? 'AGENT_ID'
    return `<script src="${baseUrl}/widget.js" data-agent-id="${id}" async></script>`
  }

  const getSubmitLabel = () => {
    if (isSaving) return 'Menyimpan...'
    if (isEdit) return 'Simpan Perubahan'
    return 'Buat Agent'
  }

  const saveAgent = (values: AgentFormValues) => {
    onSave({ ...values })
  }

  const syncEmbedCopied = async () => {
    await navigator.clipboard.writeText(getEmbedScript())
    setEmbedCopied(true)
    setTimeout(() => setEmbedCopied(false), 2000)
  }

  const getImageSlotContent = () => {
    if (isUploadingImage) return <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
    if (imagePreview) return <Image src={imagePreview} alt="Agent" className="h-full w-full object-cover" width={160} height={160} />
    return (
      <>
        <ImageIcon className="h-6 w-6 text-muted-foreground" />
        <span className="text-rem-65 text-muted-foreground mt-1">Upload</span>
      </>
    )
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!isSupabaseConfigured()) {
      toast.error('Upload gambar belum dikonfigurasi')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB')
      return
    }

    setIsUploadingImage(true)
    try {
      const supabase = getSupabaseClient()
      const ext = file.name.split('.').pop() ?? 'png'
      const path = `agents/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
      setValue('image', data.publicUrl, { shouldDirty: true })
      setImagePreview(data.publicUrl)
      toast.success('Gambar berhasil diupload')
    } catch (error) {
      console.error('Failed to upload image:', error)
      const message = error instanceof Error ? error.message : 'Gagal mengupload gambar'
      toast.error(`Gagal mengupload gambar: ${message}`)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const loadPreview = () => {
    onPreview({
      id: agent?.id ?? 'preview',
      name: formValues.name || 'Preview Agent',
      description: formValues.description || null,
      image: formValues.image || null,
      personalization: formValues.personalization || null,
      isDefault: formValues.isDefault,
      embedScript: null,
      whatsappScript: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  // lifecycle react
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 640)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  useEffect(() => {
    const el = rightColRef.current
    if (!el || !isDesktop) return
    const observer = new ResizeObserver(() => setImageBoxSize(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [isDesktop])

  useEffect(() => {
    if (agent) {
      reset({ name: agent.name, description: agent.description ?? '', image: agent.image ?? '', personalization: agent.personalization ?? '', isDefault: agent.isDefault })
      setImagePreview(agent.image ?? '')
    } else {
      reset({ name: '', description: '', image: '', personalization: '', isDefault: false })
      setImagePreview('')
    }
  }, [agent, reset])

  useEffect(() => {
    if (prefillData) {
      reset((prev) => ({
        ...prev,
        ...(prefillData.name !== undefined && { name: prefillData.name }),
        ...(prefillData.description !== undefined && { description: prefillData.description }),
        ...(prefillData.personalization !== undefined && { personalization: prefillData.personalization }),
      }))
    }
  }, [prefillData, reset])

  useImperativeHandle(ref, () => ({ triggerPreview: loadPreview }))

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-rem-130 font-bold text-foreground tracking-tight">{isEdit ? 'Edit Agent' : 'Buat Agent Baru'}</h2>
        {!isEdit && onGenerateClick && (
          <Button type="button" variant="outline" onClick={onGenerateClick} className="gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" /> Generate AI
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(saveAgent)} className="space-y-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-4">
          <div
            className="shrink-0 w-24 h-24"
            style={isDesktop ? { width: imageBoxSize, height: imageBoxSize } : undefined}
          >
            <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50 transition-colors overflow-hidden relative">
              {getImageSlotContent()}
              <input type="hidden" {...register('image')} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploadingImage}
                onChange={(e) => void handleImageUpload(e)}
              />
            </label>
          </div>

          <div ref={rightColRef} className="flex-1 min-w-0 space-y-3 w-full">
            <div className="space-y-1.5">
              <Label htmlFor="agent-name">Nama Agent</Label>
              <Input id="agent-name" {...register('name')} placeholder="Contoh: Asisten Akademik" />
              {errors.name && <p className="text-rem-80 text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agent-desc">Deskripsi</Label>
              <Textarea id="agent-desc" {...register('description')} rows={2} placeholder="Deskripsi singkat tentang agent ini..." />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="agent-pers">Personalisasi (System Prompt)</Label>
          <Textarea id="agent-pers" {...register('personalization')} rows={2} placeholder="Kamu asisten AI yang bantu..." />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="agent-isDefault"
            checked={formValues.isDefault}
            onCheckedChange={(checked) => setValue('isDefault', checked, { shouldDirty: true })}
          />
          <Label htmlFor="agent-isDefault" className="cursor-pointer font-normal">Jadikan agent default</Label>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <p className="text-rem-85 font-medium text-foreground">Embed Chatbot</p>
            <span className="inline-flex items-center text-muted-foreground cursor-help" title="Salin script HTML ini dan tempelkan ke halaman website Anda."><Info className="h-3.5 w-3.5" /></span>
          </div>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border bg-muted/30 px-4 py-3 text-rem-70 font-mono leading-relaxed whitespace-pre-wrap text-foreground">
              {getEmbedScript()}
            </pre>
            <Button type="button" variant="outline" size="sm" onClick={syncEmbedCopied} className="absolute right-2 top-2 gap-1">
              {embedCopied ? <><CheckIcon className="h-3 w-3" />Tersalin!</> : <><Copy className="h-3 w-3" />Salin</>}
            </Button>
          </div>
        </div>

        <div className="flex justify-between pt-1">
          <Button type="button" variant="outline" onClick={loadPreview} className="gap-1.5">
            <Eye className="h-4 w-4" /> Preview Agent
          </Button>
          <Button type="submit" disabled={isSaving}>
            {getSubmitLabel()}
          </Button>
        </div>
      </form>
    </div>
  )
})

export default AgentForm
