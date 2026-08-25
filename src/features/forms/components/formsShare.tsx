'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  slug: string
  id: string
  title: string
  isCompact?: boolean
}

export default function FormsShare({ slug, id, title, isCompact = false }: Props) {
  const [filters, setFilters] = useState({
    isCopied: false,
  })

  const data = useMemo(() => {
    const getOrigin = () => {
      if (typeof window !== 'undefined') return window.location.origin
      return (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/+$/, '')
    }

    const getPath = () => (slug ? `/f/${slug}` : `/forms/${id}`)

    return {
      shareUrl: `${getOrigin()}${getPath()}`,
      shareLabel: `${getOrigin().replace(/^https?:\/\//, '')}${getPath()}`,
      isCopied: filters.isCopied,
      isCompact,
    }
  }, [slug, id, filters.isCopied, isCompact])

  const submitShare = async () => {
    const getShared = async () => {
      if (typeof navigator === 'undefined') return false
      if (!navigator.share) return false

      try {
        await navigator.share({ title, url: data.shareUrl })
        return true
      } catch {
        return true
      }
    }

    const getCopied = async () => {
      try {
        await navigator.clipboard.writeText(data.shareUrl)
        return true
      } catch {
        return false
      }
    }

    if (await getShared()) return
    if (!(await getCopied())) return

    setFilters((prev) => ({ ...prev, isCopied: true }))
    window.setTimeout(
      () => setFilters((prev) => ({ ...prev, isCopied: false })),
      2000
    )
  }

  if (data.isCompact) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="w-9 px-0 sm:w-auto sm:px-4"
        onClick={submitShare}
        aria-label={`Bagikan form ${title}`}
      >
        {data.isCopied ? <Check /> : <Share2 />}
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-2 border-foreground bg-paper px-5 py-4 sm:px-7">
      <span className="brutal-eyebrow shrink-0">BAGIKAN</span>
      <code className="min-w-0 flex-1 truncate font-mono text-sm">
        {data.shareLabel}
      </code>
      <Button type="button" size="sm" onClick={submitShare}>
        {data.isCopied ? <Check /> : <Copy />}
        {data.isCopied ? 'Tersalin' : 'Salin'}
      </Button>
    </div>
  )
}
