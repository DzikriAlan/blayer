import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

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

type WithNode<T> = T & { node?: unknown }

const markdownComponents = {
  h1: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'h1'>>) => (
    <h1 className="mt-4 mb-2 text-rem-160 font-bold text-foreground first:mt-0" {...props} />
  ),
  h2: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'h2'>>) => (
    <h2 className="mt-4 mb-2 text-rem-140 font-bold text-foreground first:mt-0" {...props} />
  ),
  h3: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'h3'>>) => (
    <h3 className="mt-3 mb-1.5 text-rem-120 font-semibold text-foreground" {...props} />
  ),
  p: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'p'>>) => (
    <p className="mb-3 text-rem-85 leading-relaxed text-muted-foreground" {...props} />
  ),
  ul: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'ul'>>) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-rem-85 text-muted-foreground" {...props} />
  ),
  ol: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'ol'>>) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 text-rem-85 text-muted-foreground" {...props} />
  ),
  li: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'li'>>) => <li {...props} />,
  a: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'a'>>) => (
    <a className="text-primary underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  strong: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'strong'>>) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  code: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'code'>>) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-rem-75 text-foreground" {...props} />
  ),
  pre: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'pre'>>) => (
    <pre className="mb-3 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-rem-75 text-foreground" {...props} />
  ),
  blockquote: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'blockquote'>>) => (
    <blockquote className="mb-3 border-l-2 border-border pl-3 text-muted-foreground italic" {...props} />
  ),
  hr: () => <hr className="my-4 border-border" />,
}

interface LandingCodeTabsProps {
  readonly codeSnippets: Record<string, string>
}

export default function LandingCodeTabs({ codeSnippets }: LandingCodeTabsProps) {
  const [active, setActive] = useState(tabs[0].file)

  const activeTab = tabs.find((tab) => tab.file === active) ?? tabs[0]
  const key = activeTab.file.replace('.md', '')
  const content = codeSnippets[key]

  return (
    <div className="w-full lg:w-[620px] xl:w-[720px] lg:shrink-0">
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

        {/* Markdown viewer */}
        <div className="h-[420px] overflow-auto bg-card px-5 py-4">
          {content ? (
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
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
