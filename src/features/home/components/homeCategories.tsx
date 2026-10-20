import { cn } from '@/shared/lib/utils'

export interface HomeCategoryTab {
  name: string
  isActive: boolean
}

interface Props {
  tabs: HomeCategoryTab[]
  onEditCategory: (name: string) => void
}

// Baris kategori bergeser horizontal; di layar kecil menempel ke tepi layar agar terlihat bisa digeser
export default function HomeCategories({ tabs, onEditCategory }: Props) {
  return (
    <div
      role="group"
      aria-label="Kategori"
      className="scroll-hidden -mx-[clamp(16px,4vw,48px)] flex snap-x gap-2 overflow-x-auto scroll-px-[clamp(16px,4vw,48px)] px-[clamp(16px,4vw,48px)]"
    >
      {tabs.map((tab) => (
        <button
          key={tab.name}
          type="button"
          aria-pressed={tab.isActive}
          onClick={() => onEditCategory(tab.name)}
          className={cn(
            'h-8 shrink-0 snap-start whitespace-nowrap rounded-lg px-3.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            tab.isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/70',
          )}
        >
          {tab.name}
        </button>
      ))}
    </div>
  )
}
