import { Button } from '@/components/ui/button'

export interface HomeCategoryTab {
  name: string
  isActive: boolean
}

interface Props {
  tabs: HomeCategoryTab[]
  onEditCategory: (name: string) => void
}

export default function HomeCategories({ tabs, onEditCategory }: Props) {
  return (
    <div role="group" aria-label="Kategori" className="scroll-hidden -mx-[clamp(16px,4vw,48px)] flex gap-2 overflow-x-auto px-[clamp(16px,4vw,48px)]">
      {tabs.map((tab) => (
        <Button
          key={tab.name}
          type="button"
          variant={tab.isActive ? 'primary' : 'secondary'}
          aria-pressed={tab.isActive}
          onClick={() => onEditCategory(tab.name)}
          className="h-11 shrink-0 rounded-xl px-5 text-sm font-semibold"
        >
          {tab.name}
        </Button>
      ))}
    </div>
  )
}
