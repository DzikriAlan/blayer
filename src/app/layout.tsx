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
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ SearchDialog: DocsSearchDialog }}>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
