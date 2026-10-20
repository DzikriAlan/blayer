'use client'

import { useEffect, useMemo, useState } from 'react'
import { Moon, Sun, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/shared/lib/utils'

type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'blayer-theme'

export default function AccountDialog() {
  const [filters, setFilters] = useState<{ isOpen: boolean; theme: Theme }>({
    isOpen: false,
    theme: 'dark',
  })

  const data = useMemo(() => {
    const getThemeOption = (theme: Theme, label: string) => ({
      theme,
      label,
      isActive: filters.theme === theme,
    })

    return {
      isOpen: filters.isOpen,
      options: [getThemeOption('dark', 'Gelap'), getThemeOption('light', 'Terang')],
    }
  }, [filters])

  const editAccount = (isOpen: boolean) => {
    // utilisasi wajib ditulis di dalam parent function
    const getActiveTheme = (): Theme =>
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'

    setFilters((prev) => ({ ...prev, isOpen, theme: isOpen ? getActiveTheme() : prev.theme }))
  }

  const editTheme = (theme: Theme) => {
    // utilisasi wajib ditulis di dalam parent function
    const patchDocumentTheme = () => {
      document.documentElement.classList.toggle('dark', theme === 'dark')
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme)
      } catch {
        // penyimpanan bisa diblokir; tema tetap berlaku untuk sesi ini
      }
    }

    patchDocumentTheme()
    setFilters((prev) => ({ ...prev, theme }))
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
    <Dialog open={data.isOpen} onOpenChange={editAccount}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Akun" title="Akun" className="h-11 w-11 rounded-xl">
          <User className="!size-[22px]" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex h-11 items-center">
          <DialogTitle>Akun</DialogTitle>
        </div>
        <DialogDescription className="sr-only">Pengaturan akun dan tampilan</DialogDescription>
        <div className="flex items-center gap-3.5">
          <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <User className="h-6 w-6" />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-base font-semibold">Tamu</span>
            <span className="text-[13px] text-muted-foreground">Masuk untuk menyimpan tontonan</span>
          </span>
        </div>
        <Button size="lg" className="h-12 w-full rounded-xl">
          Masuk
        </Button>
        <div className="flex flex-col gap-2.5 border-t border-border pt-4">
          <div className="text-[13px] font-semibold text-muted-foreground">Mode tampilan</div>
          <div role="group" aria-label="Mode tampilan" className="flex rounded-2xl border border-border bg-muted p-1">
            {data.options.map((option) => (
              <button
                key={option.theme}
                type="button"
                aria-pressed={option.isActive}
                onClick={() => editTheme(option.theme)}
                className={cn(
                  'flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  option.isActive ? 'bg-primary text-primary-foreground' : 'text-foreground'
                )}
              >
                {option.theme === 'dark' ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
