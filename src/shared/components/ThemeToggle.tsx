import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

interface Props {
  collapsed?: boolean
}

export default function ThemeToggle({ collapsed }: Readonly<Props>) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const dark = saved === 'dark' || (!saved && document.documentElement.classList.contains('dark'))
    setIsDark(dark)
  }, [])

  function handleToggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex items-center gap-2.5 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground ${
        collapsed ? 'h-8 w-8 justify-center' : 'px-3 py-2.5 w-full'
      }`}
    >
      {isDark
        ? <Sun className="h-4 w-4 shrink-0" />
        : <Moon className="h-4 w-4 shrink-0" />
      }
      {!collapsed && (
        <span className="text-rem-90 font-medium truncate">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  )
}
