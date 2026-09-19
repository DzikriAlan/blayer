import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  PanelLeft,
  Bot,
  LogOut,
  Settings,
  MessageSquarePlus,
} from 'lucide-react'
import blayerLogo from '@/shared/assets/blayer.png'
import { useUIStates } from '@/shared/states/uiStates'
import ThemeToggle from './ThemeToggle'
import ConversationHistory from '@/features/chat/components/ConversationHistory'

interface NavItemProps {
  href?: string
  icon: React.ReactNode
  label: string
  collapsed: boolean
  isActive: boolean
  onClick?: () => void
}

function NavItem({ href, icon, label, collapsed, isActive, onClick }: Readonly<NavItemProps>) {
  const navActiveClass = 'bg-accent text-accent-foreground'
  const navInactiveClass = 'text-muted-foreground hover:bg-muted hover:text-foreground'
  const baseClass = `flex items-center gap-2.5 rounded-md transition-colors w-full ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'} ${isActive ? navActiveClass : navInactiveClass}`

  if (href) {
    return (
      <Link href={href} title={collapsed ? label : undefined} className={baseClass}>
        {icon}
        {!collapsed && <span className="text-rem-90 font-sans font-semibold truncate">{label}</span>}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} title={collapsed ? label : undefined} className={baseClass}>
      {icon}
      {!collapsed && <span className="text-rem-90 font-sans font-semibold truncate">{label}</span>}
    </button>
  )
}

const userName = process.env.NEXT_PUBLIC_USER_NAME ?? 'User'
const userInitials = userName.slice(0, 2).toUpperCase()
const MOBILE_BREAKPOINT_PX = 768

export default function Sidebar() {
  const router = useRouter()
  const { data: session } = useSession()
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStates()
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  // On mobile the drawer covers the page, so leaving it open after a navigation
  // hides the thing you just navigated to. Route change is the right hook: it
  // also covers the conversation links, not just the two nav items.
  useEffect(() => {
    const close = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT_PX) setSidebarOpen(false)
    }
    router.events.on('routeChangeComplete', close)
    return () => router.events.off('routeChangeComplete', close)
  }, [router.events, setSidebarOpen])

  // Dismiss the settings popover on an outside click or Escape.
  useEffect(() => {
    if (!showSettings) return

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSettings(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [showSettings])
  const displayName = session?.user?.name ?? userName
  const displayInitials = session?.user?.name
    ? session.user.name.slice(0, 2).toUpperCase()
    : userInitials
  const displayImage = session?.user?.image ?? null

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-sidebar border-r border-border flex flex-col z-30 transition-[width,transform] duration-300 ease-in-out ${
        sidebarOpen
          ? 'translate-x-0 w-64'
          : '-translate-x-full w-64 md:translate-x-0 md:w-[52px]'
      }`}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between px-3 overflow-hidden">
        {sidebarOpen ? (
          <>
            <Image src={blayerLogo} alt="Blayer" height={28} className="select-none dark:invert" />
            <button
              type="button"
              onClick={toggleSidebar}
              title="Close sidebar"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="group flex w-full justify-center">
            <Image src={blayerLogo} alt="Blayer" height={24} className="select-none group-hover:hidden dark:invert" />
            <button
              type="button"
              onClick={toggleSidebar}
              title="Open sidebar"
              className="hidden group-hover:flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="px-2 py-3 space-y-0.5 shrink-0">
        <NavItem
          href="/chat"
          icon={<MessageSquarePlus className="h-4 w-4 shrink-0" />}
          label="New Chat"
          collapsed={!sidebarOpen}
          isActive={router.pathname === '/chat' && !router.query.id}
        />
        <NavItem
          href="/agents"
          icon={<Bot className="h-4 w-4 shrink-0" />}
          label="Agents"
          collapsed={!sidebarOpen}
          isActive={router.pathname.startsWith('/agents')}
        />
      </nav>

      {sidebarOpen && <ConversationHistory collapsed={!sidebarOpen} />}

      <div className="flex-1" />

      {/* User footer */}
      <div className="px-2 py-3 shrink-0">
        {sidebarOpen ? (
          <div ref={settingsRef} className="relative">
            <button
              type="button"
              aria-expanded={showSettings}
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-muted transition-colors w-full"
            >
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayImage} alt={displayName} className="h-8 w-8 rounded-full shrink-0 object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-rem-75 font-bold">
                  {displayInitials}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-rem-85 font-gudlak font-bold text-foreground truncate">{displayName}</p>
                <p className="text-rem-70 font-sans text-muted-foreground">{session ? 'Google Account' : 'Free Plan'}</p>
              </div>
              <Settings className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>

            {showSettings && (
              <div className="absolute bottom-full left-2 right-2 z-30 mb-2 animate-scale-in overflow-hidden rounded-xl border border-border bg-card py-1 shadow-popup">
                <ThemeToggle collapsed={false} />
                {session ? (
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-rem-85 font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => signIn('google')}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-rem-85 font-medium text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign In with Google
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div ref={settingsRef} className="relative flex flex-col items-center gap-3">
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayImage} alt={displayName} className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-rem-70 font-bold">
                {displayInitials}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>

            {showSettings && (
              <div className="fixed bottom-12 left-20 z-50 animate-scale-in overflow-hidden whitespace-nowrap rounded-xl border border-border bg-card py-1 shadow-popup">
                <ThemeToggle collapsed={false} />
                {session ? (
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-rem-85 font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => signIn('google')}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-rem-85 font-medium text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign In with Google
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
