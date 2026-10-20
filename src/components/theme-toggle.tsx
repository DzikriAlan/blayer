'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'blayer-theme'

interface Props {
  className?: string
}

// Sumber kebenaran tema adalah kelas .dark di <html>; komponen hanya membacanya,
// jadi semua toggle di halaman selalu sinkron tanpa state ganda.
const subscribeTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}
const getThemeSnapshot = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
// _document memasang .dark sejak awal, jadi render server menganggap tema gelap
const getServerThemeSnapshot = (): Theme => 'dark'

// Tombol ikon tanpa border untuk berganti mode gelap/terang; pilihan disimpan di localStorage
export default function ThemeToggle({ className }: Props) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot)

  const data = useMemo(() => {
    const isDark = theme === 'dark'
    return {
      isDark,
      label: isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap',
    }
  }, [theme])

  const editTheme = () => {
    // utilisasi wajib ditulis di dalam parent function
    const patchDocumentTheme = (nextTheme: Theme) => {
      document.documentElement.classList.toggle('dark', nextTheme === 'dark')
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
      } catch {
        // penyimpanan bisa diblokir; tema tetap berlaku untuk sesi ini
      }
    }

    patchDocumentTheme(data.isDark ? 'light' : 'dark')
  }

  useEffect(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getSavedTheme = (): Theme => {
      try {
        return window.localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark'
      } catch {
        return 'dark'
      }
    }

    document.documentElement.classList.toggle('dark', getSavedTheme() === 'dark')
  }, [])

  return (
    <button
      type="button"
      onClick={editTheme}
      aria-label={data.label}
      title={data.label}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {data.isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
