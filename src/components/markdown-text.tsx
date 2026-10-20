import { Fragment, useMemo } from 'react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

interface Props {
  text: string
  className?: string
  getHashtagHref?: (tag: string) => string
}

type Block =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'heading'; text: string }
  | { type: 'rule' }

const LINK_CLASS = 'text-blue-600 hover:underline dark:text-sky-400'
const UNORDERED_ITEM = /^\s*[-*•]\s+(.+)$/
const ORDERED_ITEM = /^\s*\d+[.)]\s+(.+)$/
const HEADING = /^\s*#{1,6}\s+(.+)$/
const RULE = /^\s*([-_=*])\1{2,}\s*$/
// Urutan penting: link markdown dan URL dulu agar tanda _ atau * di dalam URL tidak dianggap format
const INLINE = /(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<>()]+|\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\s\n][^*\n]*\*|#[\p{L}\p{N}_]+)/gu

// Markdown ringan untuk deskripsi video. Semua hasil dirender sebagai elemen React,
// tidak ada HTML mentah, jadi isi deskripsi tidak bisa menyisipkan script.
export default function MarkdownText({ text, className, getHashtagHref }: Props) {
  const data = useMemo(() => {
    // utilisasi wajib ditulis di dalam parent function
    const getBlocks = (source: string) => {
      const blocks: Block[] = []
      let paragraph: string[] = []
      const flushParagraph = () => {
        if (paragraph.length) blocks.push({ type: 'paragraph', lines: paragraph })
        paragraph = []
      }

      for (const line of source.replace(/\r\n?/g, '\n').split('\n')) {
        const unordered = UNORDERED_ITEM.exec(line)
        const ordered = ORDERED_ITEM.exec(line)
        const heading = HEADING.exec(line)
        const last = blocks.at(-1)

        if (!line.trim()) {
          flushParagraph()
        } else if (RULE.test(line)) {
          flushParagraph()
          blocks.push({ type: 'rule' })
        } else if (heading) {
          flushParagraph()
          blocks.push({ type: 'heading', text: heading[1] })
        } else if (unordered || ordered) {
          flushParagraph()
          const isOrdered = !!ordered && !unordered
          const item = (unordered ?? ordered)?.[1] ?? ''
          if (last?.type === 'list' && last.ordered === isOrdered) last.items.push(item)
          else blocks.push({ type: 'list', ordered: isOrdered, items: [item] })
        } else {
          paragraph.push(line)
        }
      }
      flushParagraph()
      return blocks
    }

    return { blocks: getBlocks(text) }
  }, [text])

  // Teks satu baris -> potongan teks, tebal, miring, kode, link, dan tagar
  const loadInline = (line: string): ReactNode[] =>
    line.split(INLINE).filter(Boolean).map((part, index) => {
      const markdownLink = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(part)
      if (markdownLink) {
        return (
          <a key={index} href={markdownLink[2]} target="_blank" rel="noreferrer nofollow" className={LINK_CLASS}>
            {markdownLink[1]}
          </a>
        )
      }
      if (/^https?:\/\//.test(part)) {
        // Tanda baca di ujung kalimat bukan bagian dari URL
        const url = part.replace(/[.,;:!?'"]+$/, '')
        return (
          <Fragment key={index}>
            <a href={url} target="_blank" rel="noreferrer nofollow" className={cn(LINK_CLASS, 'break-all')}>
              {url}
            </a>
            {part.slice(url.length)}
          </Fragment>
        )
      }
      if (/^(\*\*|__).+\1$/.test(part)) return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
      if (/^`.+`$/.test(part)) return <code key={index} className="rounded bg-background px-1 py-0.5 font-mono text-[0.92em]">{part.slice(1, -1)}</code>
      if (/^\*[^*].*\*$/.test(part)) return <em key={index}>{part.slice(1, -1)}</em>
      if (/^#[\p{L}\p{N}_]+$/u.test(part) && getHashtagHref) {
        return (
          <a key={index} href={getHashtagHref(part.slice(1))} target="_blank" rel="noreferrer nofollow" className={LINK_CLASS}>
            {part}
          </a>
        )
      }
      return <Fragment key={index}>{part}</Fragment>
    })

  return (
    <div className={cn('flex flex-col gap-3 text-sm leading-relaxed', className)}>
      {data.blocks.map((block, blockIndex) => {
        if (block.type === 'rule') return <hr key={blockIndex} className="my-1 border-border" />
        if (block.type === 'heading') {
          return <p key={blockIndex} className="m-0 font-semibold text-foreground">{loadInline(block.text)}</p>
        }
        if (block.type === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul'
          return (
            <ListTag key={blockIndex} className={cn('m-0 flex flex-col gap-1 pl-5', block.ordered ? 'list-decimal' : 'list-disc')}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="wrap-any pl-0.5">{loadInline(item)}</li>
              ))}
            </ListTag>
          )
        }
        return (
          <p key={blockIndex} className="wrap-any m-0">
            {block.lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {loadInline(line)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
