import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

// Pengujian berjalan dari folder kosong (lihat test/setup.server.ts), jadi akar
// project dicari dari letak berkas ini.
const ROOT = path.resolve(__dirname, '../..')
const DOCS_DIR = path.join(ROOT, 'content/docs')

const meta = JSON.parse(
  readFileSync(path.join(DOCS_DIR, 'meta.json'), 'utf8')
) as { pages: string[] }

const pages = readdirSync(DOCS_DIR).filter((file) => file.endsWith('.mdx'))

const getFrontmatter = (file: string) => {
  const raw = readFileSync(path.join(DOCS_DIR, file), 'utf8')
  const match = raw.match(/^---\n([\s\S]*?)\n---/)

  return match?.[1] ?? ''
}

describe('isi dokumentasi', () => {
  it('TC-89a mendaftarkan tiap halaman yang ada di sidebar', () => {
    for (const page of meta.pages) {
      expect(
        existsSync(path.join(DOCS_DIR, `${page}.mdx`)),
        `halaman ${page} disebut meta.json tapi berkasnya tidak ada`
      ).toBe(true)
    }
  })

  it('TC-89b tidak meninggalkan halaman yatim di luar sidebar', () => {
    const listed = new Set(meta.pages)

    for (const file of pages) {
      const name = file.replace(/\.mdx$/, '')

      expect(
        listed.has(name),
        `halaman ${name} ada tapi tidak disebut meta.json, jadi tidak muncul di sidebar`
      ).toBe(true)
    }
  })

  it('TC-89c memberi tiap halaman judul dan deskripsi', () => {
    for (const file of pages) {
      const frontmatter = getFrontmatter(file)

      expect(frontmatter, `${file} tidak punya frontmatter`).not.toBe('')
      expect(frontmatter).toContain('title:')
      expect(frontmatter).toContain('description:')
    }
  })

  it('TC-89d memakai bahasa yang dikenal shiki pada tiap blok kode', () => {
    // `env` bukan bahasa bawaan shiki dan membuat build gagal; yang dipakai di
    // sini sengaja dibatasi pada yang sudah terbukti ikut dalam bundelnya.
    const allowed = new Set(['bash', 'ts', 'tsx', 'js', 'json', 'ini', 'text', 'sql'])

    for (const file of pages) {
      const raw = readFileSync(path.join(DOCS_DIR, file), 'utf8')

      for (const line of raw.split('\n')) {
        if (!line.startsWith('```')) continue

        const lang = line.slice(3).split(' ')[0]?.trim()
        if (!lang) continue

        expect(allowed.has(lang), `${file} memakai bahasa "${lang}"`).toBe(true)
      }
    }
  })
})
