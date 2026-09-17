import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ChevronDown, MessageCircle, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import { useConversationHistoryStates, type Conversation } from '../states/conversationHistoryStates'
import { useConversationHistoryControllers } from '../controllers/conversationHistoryControllers'

interface Props {
  collapsed?: boolean
}

export default function ConversationHistory({ collapsed }: Readonly<Props>) {
  const router = useRouter()
  const { conversations, hasLoaded, deletingIds, setConversations, removeConversation, renameConversation, markDeleting } =
    useConversationHistoryStates()
  const { fetchChatConversations, storeChatConversationsRename, removeChatConversationsDetail } =
    useConversationHistoryControllers()
  const [isExpanded, setIsExpanded] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const loadConversations = async () => {
    try {
      const data = await fetchChatConversations()
      setConversations((data as Conversation[]).slice(0, 10))
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }

  useEffect(() => {
    // Refetch on every mount to stay fresh, but keep showing the cached
    // list from the store in the meantime instead of blanking the section.
    void loadConversations()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url.startsWith('/chat/')) {
        void loadConversations()
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => router.events.off('routeChangeComplete', handleRouteChange)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.events])

  const handleDeleteConversation = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    setDeleteTargetId(sessionId)
  }

  const confirmDeleteConversation = async () => {
    if (!deleteTargetId) return
    const sessionId = deleteTargetId
    setDeleteTargetId(null)
    markDeleting(sessionId, true)
    try {
      await removeChatConversationsDetail.mutateAsync(sessionId)
      removeConversation(sessionId)
      toast.success('Percakapan berhasil dihapus')
      if (router.asPath === `/chat/${sessionId}`) void router.push('/home')
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      toast.error('Gagal menghapus percakapan')
      markDeleting(sessionId, false)
    }
  }

  const handleRenameStart = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation()
    setEditingId(conv.sessionId)
    setEditTitle(conv.title || '')
  }

  const handleRenameSave = async (sessionId: string) => {
    if (!editTitle.trim()) return
    try {
      await storeChatConversationsRename.mutateAsync({ sessionId, title: editTitle })
      renameConversation(sessionId, editTitle)
      setEditingId(null)
    } catch (error) {
      console.error('Failed to rename conversation:', error)
    }
  }

  const handleRenameCancel = () => {
    setEditingId(null)
    setEditTitle('')
  }

  if (collapsed || !hasLoaded) return null

  return (
    <div className="px-2 py-3 shrink-0 border-t border-border">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-rem-85 font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
        Chat History
      </button>

      {isExpanded && conversations.length > 0 && (
        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
          {conversations.map((conv) => {
            const isDeletingThis = deletingIds.includes(conv.sessionId)
            return (
              <div key={conv.sessionId} className="group rounded-md">
                {editingId === conv.sessionId ? (
                  <div className="flex items-center gap-1 px-2 py-1">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 px-2 py-1 rounded text-rem-85 bg-black/30 text-foreground border border-border outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void handleRenameSave(conv.sessionId)
                        if (e.key === 'Escape') handleRenameCancel()
                      }}
                    />
                    <button
                      onClick={() => void handleRenameSave(conv.sessionId)}
                      className="p-1 text-green-400 hover:text-green-300"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={handleRenameCancel} className="p-1 text-red-400 hover:text-red-300">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-rem-85 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <button
                      type="button"
                      onClick={() => !isDeletingThis && void router.push(`/chat/${conv.sessionId}`)}
                      disabled={isDeletingThis}
                      className="flex flex-1 min-w-0 items-center gap-2 text-left disabled:opacity-50"
                      title={conv.title || 'Untitled'}
                    >
                      <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1 truncate">{conv.title || 'Untitled'}</span>
                    </button>
                    {isDeletingThis ? (
                      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
                    ) : (
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleRenameStart(e, conv)}
                          className="p-1 text-muted-foreground hover:text-blue-400"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteConversation(e, conv.sessionId)}
                          className="p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {isExpanded && conversations.length === 0 && (
        <p className="px-3 py-2 text-rem-80 text-muted-foreground">No conversations yet</p>
      )}

      <ConfirmDialog
        open={deleteTargetId !== null}
        title="Hapus percakapan ini?"
        description="Riwayat pesan pada percakapan ini akan hilang secara permanen."
        onConfirm={() => void confirmDeleteConversation()}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  )
}
