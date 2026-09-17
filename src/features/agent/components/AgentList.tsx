'use client'

import { useState, useMemo, useRef } from 'react'
import { Bot, Plus, Search, X, ArrowLeft, PanelLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useUIStates } from '@/shared/states/uiStates'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import { useAgentControllers } from '../controllers/agentControllers'
import { useAgentStates } from '../states/agentStates'
import type { DataAgent } from '../types/agentTypes'
import AgentForm, { type AgentFormHandle, type AgentPrefillData } from './AgentForm'
import AgentPreviewInline from './AgentPreviewInline'
import AgentCard from './AgentCard'
import AgentGenerateModal from './AgentGenerateModal'

type ViewMode = 'list' | 'create' | 'preview'

export default function AgentList() {
  // variable importer
  const { storeAgent, removeAgent, modifyAgent } = useAgentControllers()
  const { toggleSidebar } = useUIStates()
  const { agentList } = useAgentStates()

  // states / variable
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editAgent, setEditAgent] = useState<DataAgent | null>(null)
  const [previewAgent, setPreviewAgent] = useState<DataAgent | null>(null)
  const [prevMode, setPrevMode] = useState<ViewMode>('list')
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [prefillData, setPrefillData] = useState<AgentPrefillData | undefined>()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const agentFormRef = useRef<AgentFormHandle>(null)
  const isSaving = storeAgent.isPending || modifyAgent.isPending
  const filtered = ((agentList.data as DataAgent[]) ?? []).filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
  const skeletonIds = useMemo(() => ['sk-1', 'sk-2', 'sk-3', 'sk-4'], [])

  // function / methode
  const saveAgent = async (data: {
    name: string; description: string; image: string; personalization: string; isDefault: boolean
  }) => {
    if (editAgent) {
      await modifyAgent.mutateAsync({ id: editAgent.id, payload: data })
    } else {
      await storeAgent.mutateAsync(data)
    }
    setViewMode('list')
    setEditAgent(null)
    setPrefillData(undefined)
  }

  const handleGenerated = (data: AgentPrefillData) => {
    setEditAgent(null)
    setPrefillData(data)
    setViewMode('create')
  }

  const confirmDestroyAgent = async () => {
    if (!deleteTargetId) return
    try {
      await removeAgent.mutateAsync(deleteTargetId)
      toast.success('Agent berhasil dihapus')
    } catch {
      toast.error('Gagal menghapus agent')
    } finally {
      setDeleteTargetId(null)
    }
  }

  const syncViewMode = () => {
    if (viewMode === 'preview' && prevMode === 'create') {
      setViewMode('create')
      setPrevMode('list')
    } else {
      setViewMode('list')
      setEditAgent(null)
      setPreviewAgent(null)
    }
  }

  const loadPreview = (a: DataAgent) => {
    setPrevMode(viewMode)
    setPreviewAgent(a)
    setViewMode('preview')
  }

  // lifecycle react (implicit - no effects for this component)
  if (viewMode === 'create') {
    return (
      <div className="flex-1 max-w-3xl mx-auto w-full">
        {/* Mobile navbar overlay */}
        <div className="md:hidden fixed top-0 inset-x-0 h-14 z-40 bg-card border-b flex items-center justify-between px-4">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={syncViewMode}
            className="flex items-center gap-1.5 text-rem-90 font-medium text-foreground hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
        </div>
        {/* Desktop back button */}
        <button type="button" onClick={syncViewMode} className="hidden md:flex items-center gap-1.5 text-rem-90 font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Kembali ke daftar agent
        </button>
        <AgentForm ref={agentFormRef} agent={editAgent} isSaving={isSaving} prefillData={prefillData} onSave={saveAgent} onPreview={loadPreview} onGenerateClick={() => setGenerateModalOpen(true)} />
        <AgentGenerateModal
          open={generateModalOpen}
          onClose={() => setGenerateModalOpen(false)}
          onGenerated={handleGenerated}
        />
      </div>
    )
  }

  if (viewMode === 'preview' && previewAgent) {
    return (
      <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col min-h-0">
        {/* Mobile navbar overlay */}
        <div className="md:hidden fixed top-0 inset-x-0 h-14 z-40 bg-card border-b flex items-center justify-between px-4">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={syncViewMode}
            className="flex items-center gap-1.5 text-rem-90 font-medium text-foreground hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {prevMode === 'create' ? 'Kembali ke buat agent' : 'Kembali'}
          </button>
        </div>
        {/* Desktop back button */}
        <button type="button" onClick={syncViewMode} className="hidden md:flex items-center gap-1.5 text-rem-90 font-medium text-muted-foreground hover:text-foreground transition-colors mb-4 shrink-0">
          <ArrowLeft className="h-4 w-4" /> {prevMode === 'create' ? 'Kembali ke buat agent' : 'Kembali ke daftar agent'}
        </button>
        <AgentPreviewInline agent={previewAgent} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Bot className="h-7 w-7 text-primary" />
          </div>
        </div>
        <h1 className="text-rem-150 font-bold text-foreground tracking-tight">AI Agents</h1>
        <p className="text-rem-95 text-muted-foreground">Kelola agent AI Anda dengan personalisasi dan knowledge base</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari agent..." className="pl-10 pr-8 rounded-xl h-auto py-2.5" />
          {search && <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
        </div>
        <Button type="button" onClick={() => { setEditAgent(null); setPrefillData(undefined); setViewMode('create') }} className="gap-1.5 rounded-xl shrink-0">
          <Plus className="h-4 w-4" /> Buat Agent
        </Button>
      </div>

      {agentList.status === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skeletonIds.map((id) => (
            <div key={id} className="rounded-xl border bg-card p-5 animate-pulse">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-rem-100 font-semibold truncate bg-muted text-transparent rounded w-2/3 select-none">Nama Agent</h3>
                  <p className="text-rem-85 mt-0.5 line-clamp-2 bg-muted text-transparent rounded select-none">Deskripsi singkat agent yang mengisi dua baris teks</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t">
                <span className="text-rem-85 font-medium rounded-lg px-2.5 py-1.5 bg-muted text-transparent select-none">Ubah</span>
                <span className="text-rem-85 font-medium rounded-lg px-2.5 py-1.5 bg-muted text-transparent select-none">Preview Agent</span>
                <span className="rounded-lg px-2.5 py-1.5 bg-muted ml-auto select-none"><Trash2 className="h-3.5 w-3.5 text-transparent" /></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {agentList.status !== 'loading' && filtered.length === 0 && !search && (
        <div className="py-16 text-center">
          <Bot className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-rem-110 font-semibold text-foreground">Belum ada agent</p>
          <p className="text-rem-90 text-muted-foreground mt-1">Buat agent pertama Anda dengan klik tombol di atas</p>
        </div>
      )}

      {agentList.status !== 'loading' && filtered.length === 0 && search && (
        <div className="py-12 text-center">
          <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-rem-100 font-semibold text-foreground">Tidak ditemukan</p>
          <p className="text-rem-85 text-muted-foreground mt-1">Tidak ada agent dengan nama &quot;{search}&quot;</p>
        </div>
      )}

      {agentList.status !== 'loading' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={(a) => { setEditAgent(a); setViewMode('create') }}
              onPreview={loadPreview}
              onDelete={setDeleteTargetId}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTargetId !== null}
        title="Hapus agent ini?"
        description="Percakapan yang sudah tersimpan tetap ada, tapi agent ini tidak akan bisa dipakai lagi."
        isLoading={removeAgent.isPending}
        onConfirm={() => void confirmDestroyAgent()}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  )
}
