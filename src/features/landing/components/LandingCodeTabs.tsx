import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { common } from 'lowlight'
import dart from 'highlight.js/lib/languages/dart'
import typescript from 'highlight.js/lib/languages/typescript'
import toast from 'react-hot-toast'
import { Github, Copy, ChevronDown, BookOpen } from 'lucide-react'

const readmeContent = `## Cara Pakai

1. Simpan file yang kamu generate (misal \`NEXT.md\`) sebagai \`CODE.md\` di root project kamu.
2. Tambahkan hook berikut ke \`.claude/settings.json\` atau \`.claude/settings.local.json\` project kamu:

\`\`\`json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "if [ -f \\"$CLAUDE_PROJECT_DIR/CODE.md\\" ]; then echo '--- CODE.md context ---'; cat \\"$CLAUDE_PROJECT_DIR/CODE.md\\"; fi"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "if [ -f \\"$CLAUDE_PROJECT_DIR/CODE.md\\" ]; then echo '--- CODE.md context ---'; cat \\"$CLAUDE_PROJECT_DIR/CODE.md\\"; fi"
          }
        ]
      }
    ]
  }
}
\`\`\`

3. Selesai — setiap sesi baru dan setiap prompt yang kamu kirim, Claude Code otomatis membaca \`CODE.md\` dan menyuntikkannya sebagai konteks. AI selalu ingat arsitektur, tech stack, dan aturan penamaan project kamu tanpa perlu dijelaskan ulang.
`

const rehypeHighlightOptions = {
  languages: { ...common, dart, tsx: typescript, jsx: typescript },
  aliases: { xml: ['vue'] },
}

interface CodeTab {
  label: string
  file: string
  repo: string
}

const tabs: CodeTab[] = [
  { label: 'Next.js', file: 'NEXT.md', repo: 'https://github.com/DzikriAlan/next-starter' },
  { label: 'Nuxt', file: 'NUXT.md', repo: 'https://github.com/DzikriAlan/nuxt-starter' },
  { label: 'Go', file: 'GO.md', repo: 'https://github.com/DzikriAlan/go-starter' },
  { label: 'Rust', file: 'RUST.md', repo: 'https://github.com/DzikriAlan/rust-starter' },
  { label: 'Flutter', file: 'FLUTTER.md', repo: 'https://github.com/DzikriAlan/flutter-starter' },
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
  code: ({ node: _node, className, ...props }: WithNode<React.ComponentPropsWithoutRef<'code'>>) => {
    const isBlock = className?.includes('hljs') ?? false
    if (isBlock) {
      return <code className={`${className} font-mono text-rem-75`} {...props} />
    }
    return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-rem-75 text-foreground" {...props} />
  },
  pre: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'pre'>>) => (
    <pre className="mb-3 overflow-x-auto rounded-lg p-3" {...props} />
  ),
  blockquote: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'blockquote'>>) => (
    <blockquote className="mb-3 border-l-2 border-border pl-3 text-muted-foreground italic" {...props} />
  ),
  hr: () => <hr className="my-4 border-border" />,
  table: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'table'>>) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-rem-80" {...props} />
    </div>
  ),
  thead: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'thead'>>) => (
    <thead className="bg-muted" {...props} />
  ),
  tbody: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'tbody'>>) => <tbody {...props} />,
  tr: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'tr'>>) => (
    <tr className="border-b border-border" {...props} />
  ),
  th: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'th'>>) => (
    <th className="border border-border px-3 py-1.5 text-left font-semibold text-foreground" {...props} />
  ),
  td: ({ node: _node, ...props }: WithNode<React.ComponentPropsWithoutRef<'td'>>) => (
    <td className="border border-border px-3 py-1.5 text-muted-foreground" {...props} />
  ),
}

interface LandingCodeTabsProps {
  readonly codeSnippets: Record<string, string>
}

export default function LandingCodeTabs({ codeSnippets }: LandingCodeTabsProps) {
  const [active, setActive] = useState(tabs[0].file)
  const [showReadme, setShowReadme] = useState(false)

  const activeTab = tabs.find((tab) => tab.file === active) ?? tabs[0]
  const key = activeTab.file.replace('.md', '')
  const content = codeSnippets[key]

  const handleCopy = async () => {
    if (!content) return
    await navigator.clipboard.writeText(content)
    toast.success(`${activeTab.file} copied to clipboard`)
  }

  const viewerContent = showReadme ? readmeContent : content

  return (
    <div className="w-full flex-1 min-w-0 max-w-xl lg:max-w-none">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>

        {/* Stack picker + actions */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-3 py-2">
          <div className="relative">
            <select
              value={active}
              onMouseDown={() => setShowReadme(false)}
              onChange={(e) => {
                setActive(e.target.value)
                setShowReadme(false)
              }}
              className="appearance-none rounded-lg border border-border bg-card py-1.5 pl-3 pr-7 text-rem-70 font-medium text-foreground hover:bg-card/70 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {tabs.map((tab) => (
                <option key={tab.file} value={tab.file}>
                  {tab.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReadme((prev) => !prev)}
              aria-label="Readme"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-rem-70 font-medium transition-colors sm:px-3 ${
                showReadme
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground hover:bg-muted/60'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Readme</span>
            </button>
            <a
              href={activeTab.repo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Repository"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5 text-rem-70 font-medium text-foreground hover:bg-muted/60 transition-colors sm:px-3"
            >
              <Github className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Repository</span>
            </a>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy .md"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5 text-rem-70 font-medium text-foreground hover:bg-muted/60 transition-colors sm:px-3"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Copy .md</span>
            </button>
          </div>
        </div>

        {/* Markdown viewer */}
        <div className="h-[560px] overflow-auto bg-card px-5 py-4">
          {viewerContent ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[[rehypeHighlight, rehypeHighlightOptions]]}
              components={markdownComponents}
            >
              {viewerContent}
            </ReactMarkdown>
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
