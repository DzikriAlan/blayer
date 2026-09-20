import type { ReactNode } from 'react'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'

import { docsSource } from '@/shared/lib/docsSource'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={docsSource.pageTree}
      nav={{ title: 'Blayer · Dokumentasi', url: '/' }}
      links={[
        { text: 'Console', url: '/console' },
        { text: 'GitHub', url: 'https://github.com/DzikriAlan/blayer', external: true },
      ]}
    >
      {children}
    </DocsLayout>
  )
}
