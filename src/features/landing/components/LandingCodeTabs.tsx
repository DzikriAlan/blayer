import { useState } from 'react'

interface CodeTab {
  label: string
  file: string
}

const tabs: CodeTab[] = [
  { label: 'Next.js', file: 'NEXT.md' },
  { label: 'Nuxt', file: 'NUXT.md' },
  { label: 'React', file: 'REACT.md' },
  { label: 'Vue', file: 'VUE.md' },
  { label: 'Go', file: 'GO.md' },
  { label: 'Rust', file: 'RUST.md' },
  { label: 'Flutter', file: 'FLUTTER.md' },
]

interface LandingCodeTabsProps {
  readonly codeSnippets: Record<string, string>
}

export default function LandingCodeTabs({ codeSnippets }: LandingCodeTabsProps) {
  const [active, setActive] = useState(tabs[0].file)

  const activeTab = tabs.find((tab) => tab.file === active) ?? tabs[0]
  const key = activeTab.file.replace('.md', '')
  const content = codeSnippets[key]

  return (
    <div className="w-full flex-1 max-w-xl lg:max-w-none">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-foreground/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/40" />
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-border bg-muted/20">
          {tabs.map((tab) => (
            <button
              key={tab.file}
              type="button"
              onClick={() => setActive(tab.file)}
              className={`shrink-0 whitespace-nowrap border-r border-border px-4 py-2.5 text-rem-80 font-medium transition-colors ${
                active === tab.file
                  ? 'bg-card text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              {tab.file}
            </button>
          ))}
        </div>

        {/* Code viewer */}
        <div className="h-[420px] overflow-auto bg-card px-5 py-4">
          {content ? (
            <pre className="whitespace-pre-wrap font-mono text-rem-75 leading-relaxed text-foreground">
              {content}
            </pre>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-rem-90 text-muted-foreground">{activeTab.label} — coming soon</p>
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 text-center text-rem-80 text-muted-foreground">
        Documentation Blayer generates per stack
      </p>
    </div>
  )
}
