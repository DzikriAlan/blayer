'use client'

import Link from 'next/link'
import {
  BookOpen,
  Bot,
  KeyRound,
  LayoutDashboard,
  Plug,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/shared/lib/utils'

export type ProjectsMenuKey =
  | 'ringkasan'
  | 'agent'
  | 'keys'
  | 'credentials'
  | 'integrations'
  | 'knowledge'

interface ProjectsMenuItem {
  key: ProjectsMenuKey
  label: string
  hint: string
  icon: LucideIcon
}

export const PROJECTS_MENUS: ProjectsMenuItem[] = [
  { key: 'ringkasan', label: 'Ringkasan', hint: 'Isi project sekilas', icon: LayoutDashboard },
  { key: 'agent', label: 'Agent', hint: 'Daftar dan pembuatan agent', icon: Bot },
  { key: 'keys', label: 'API Key', hint: 'Kunci untuk memanggil agent', icon: KeyRound },
  { key: 'credentials', label: 'Kredensial', hint: 'Kunci provider per environment', icon: ShieldCheck },
  { key: 'integrations', label: 'Integration', hint: 'Endpoint milikmu sebagai tool', icon: Plug },
  { key: 'knowledge', label: 'Knowledge', hint: 'Dokumen rujukan agent', icon: BookOpen },
]

export const getProjectsMenu = (value: unknown): ProjectsMenuKey =>
  PROJECTS_MENUS.find((menu) => menu.key === value)?.key ?? 'ringkasan'

interface Props {
  projectId: string
  active: ProjectsMenuKey
}

export default function ProjectsMenu({ projectId, active }: Props) {
  return (
    <nav aria-label="Menu project" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {PROJECTS_MENUS.map((menu) => {
        const isActive = menu.key === active
        const Icon = menu.icon

        return (
          <Link
            key={menu.key}
            href={{ pathname: `/console/projects/${projectId}`, query: { menu: menu.key } }}
            shallow
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors lg:w-full',
              isActive
                ? 'bg-primary/10 text-foreground ring-1 ring-inset ring-primary/30'
                : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
            <span className="whitespace-nowrap">{menu.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
