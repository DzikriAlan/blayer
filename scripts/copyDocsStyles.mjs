#!/usr/bin/env node
/**
 * Menyalin stylesheet Fumadocs ke public/vendor.
 *
 * Berkas itu keluaran Tailwind v4 yang sudah jadi, sementara aplikasi ini
 * memakai Tailwind v3. Mengimpornya lewat JavaScript membuat PostCSS ikut
 * mengolahnya dan gagal di `@layer base`. Disalin ke public lalu dipasang
 * sebagai <link>, isinya sampai ke peramban apa adanya tanpa lewat pipeline.
 */

import { copyFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)

const targetDir = path.resolve('public/vendor')
mkdirSync(targetDir, { recursive: true })

const sources = [['fumadocs-ui/style.css', 'fumadocs-ui.css']]

for (const [specifier, name] of sources) {
  copyFileSync(require.resolve(specifier), path.join(targetDir, name))
}

console.log(`[docs] ${sources.length} stylesheet disalin ke public/vendor`)
