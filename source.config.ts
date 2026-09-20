import { defineConfig, defineDocs } from 'fumadocs-mdx/config'

// Sumber dokumentasi. Isinya MDX biasa di content/docs, jadi menulis halaman
// baru tidak perlu menyentuh kode — cukup menambah berkas dan mendaftarkannya
// di meta.json.
export const docs = defineDocs({
  dir: 'content/docs',
})

export default defineConfig()
