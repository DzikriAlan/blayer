'use client'

import DefaultSearchDialog from 'fumadocs-ui/components/dialog/search-default'
import type { SharedProps } from 'fumadocs-ui/contexts/search'

// Dialog pencarian bawaan Fumadocs memanggil /api/search, sementara alamat itu
// sudah dipegang tabel rute backend. Pembungkus ini hanya memindahkan alamatnya.
export default function DocsSearchDialog(props: SharedProps) {
  return <DefaultSearchDialog {...props} api="/docs-search" />
}
