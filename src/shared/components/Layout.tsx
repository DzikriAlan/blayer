import { useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
import { PanelLeft } from 'lucide-react'
import Sidebar from './Sidebar'
import { useUIStates } from '@/shared/states/uiStates'

const MOBILE_BREAKPOINT_PX = 768

interface Props {
  title?: string
  noPadding?: boolean
  hideTitleMobile?: boolean
  headerRight?: ReactNode
  children: ReactNode
}

export default function Layout({ title, noPadding, hideTitleMobile, headerRight, children }: Readonly<Props>) {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStates()

  // Runs before the browser paints (unlike useEffect), so the mobile-collapsed
  // correction is invisible — no flash of the SSR-matching "open" default.
  useLayoutEffect(() => {
    if (window.innerWidth < MOBILE_BREAKPOINT_PX) setSidebarOpen(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />

      {sidebarOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`flex-1 flex flex-col h-dvh transition-[margin-left] duration-300 ease-in-out ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-[52px]'
        }`}
      >
        <div className={`md:hidden flex h-14 shrink-0 items-center ${headerRight ? 'justify-between' : ''} px-4 bg-card sticky top-0 z-10`}>
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          {headerRight}
        </div>

        {title && (
          <header className={`h-14 md:h-16 shrink-0 items-center bg-card px-4 md:px-6 ${hideTitleMobile ? 'hidden md:flex' : 'flex'}`}>
            <h1 className="text-rem-100 md:text-rem-110 font-semibold text-foreground">{title}</h1>
          </header>
        )}
        <main className={`flex-1 ${noPadding ? 'min-h-0 overflow-hidden' : 'p-4 md:p-6'}`}>{children}</main>
      </div>
    </div>
  )
}
