'use client'

import { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'

const THEME_STORAGE_KEY = 'blayer-theme'

interface Props {
  className?: string
}

export default function ThemeToggle({ className }: Props) {
  const editTheme = () => {
    // utilisasi wajib ditulis di dalam parent function
    const patchDocumentTheme = (isDark: boolean) => {
      document.documentElement.classList.toggle('dark', isDark)
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light')
      } catch {
        // penyimpanan bisa diblokir; tema tetap berlaku untuk sesi ini
      }
    }

    patchDocumentTheme(!document.documentElement.classList.contains('dark'))
  }

  useEffect(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getSavedTheme = () => {
      try {
        return window.localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark'
      } catch {
        return 'dark'
      }
    }

    document.documentElement.classList.toggle('dark', getSavedTheme() === 'dark')
  }, [])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Ganti mode terang atau gelap"
      title="Ganti mode terang atau gelap"
      onClick={editTheme}
      className={cn('h-11 w-11 rounded-xl border-0 text-current hover:text-current', className)}
    >
      <Sun className="hidden !size-[22px] dark:block" />
      <Moon className="!size-[22px] dark:hidden" />
    </Button>
  )
}
