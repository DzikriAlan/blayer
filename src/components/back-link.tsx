'use client'

import Link from 'next/link'
import { useRouter } from 'next/router'
import { ArrowLeft } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface Props {
  href: string
  className?: string
  label?: string
}

export default function BackLink({
  href,
  className,
  label = 'Kembali ke halaman sebelumnya',
}: Props) {
  const router = useRouter()

  const loadPrevious = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return
    }

    if (window.history.length <= 1) return

    event.preventDefault()
    router.back()
  }

  return (
    <Link
      href={href}
      onClick={loadPrevious}
      aria-label={label}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center border-2 transition-colors',
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
    </Link>
  )
}
