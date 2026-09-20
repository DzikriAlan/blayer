import { loader } from 'fumadocs-core/source'

import { docs } from '@/.source'

// Satu sumber halaman dokumentasi. Berkas .source dibangkitkan fumadocs-mdx
// dari content/docs saat dev dan build, jadi tidak ikut masuk repositori.
const mdxSource = docs.toFumadocsSource()

// fumadocs-mdx menyerahkan daftar berkasnya sebagai fungsi, sementara loader
// milik fumadocs-core versi ini menunggu senarai yang sudah jadi. Selisih satu
// pemanggilan itu dijembatani di sini supaya terlihat, bukan disembunyikan di
// balik versi yang dikunci.
const files =
  typeof mdxSource.files === 'function'
    ? (mdxSource.files as () => unknown[])()
    : mdxSource.files

export const docsSource = loader({
  baseUrl: '/docs',
  source: { ...mdxSource, files } as typeof mdxSource,
})
