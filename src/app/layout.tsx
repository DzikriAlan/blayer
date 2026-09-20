import type { ReactNode } from 'react'
import { RootProvider } from 'fumadocs-ui/provider'

import DocsSearchDialog from './docs-search-dialog'

import { fontClassName } from '@/shared/styles/fonts'

import './docs-theme.css'

// Rangka khusus rute App Router. Halaman lain masih memakai Pages Router dengan
// _document.tsx-nya sendiri; keduanya memang bisa hidup berdampingan.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={fontClassName} suppressHydrationWarning>
      <head>
        {/* Disalin ke public/vendor oleh scripts/copyDocsStyles.mjs. */}
        <link rel="stylesheet" href="/vendor/fumadocs-ui.css" />
      </head>
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ SearchDialog: DocsSearchDialog }}>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
