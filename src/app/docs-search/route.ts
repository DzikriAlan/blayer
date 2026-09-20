import { createFromSource } from 'fumadocs-core/search/server'

import { docsSource } from '@/shared/lib/docsSource'

// Alamatnya sengaja di luar /api dan /docs: keduanya sudah dipegang rute lain —
// /api oleh tabel rute backend, /docs oleh halaman dokumentasinya sendiri.
export const { GET } = createFromSource(docsSource)
