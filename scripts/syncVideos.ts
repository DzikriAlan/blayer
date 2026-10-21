/**
 * Scrape harian video beranda ke Supabase.
 *
 * Dijalankan GitHub Actions setiap jam 10.00 WIB (.github/workflows/sync-videos.yml),
 * atau manual dengan `npm run videos:sync`. Alamat basis data dibaca dengan cara
 * yang sama seperti aplikasi (DATABASE_URL, SUPABASE_DIRECT_CONNECTION_STRING, ...).
 */

import { videosService } from '@server/features/videos/services/videos.service'
import { prismaService } from '@server/shared/prisma.service'

const main = async () => {
  const result = await videosService.postVideosSync()

  for (const category of result.categories) {
    console.log(`${category.name}: ${category.total} video${category.error ? ` (gagal: ${category.error})` : ''}`)
  }
  console.log(`Tersimpan ${result.saved} video, ${result.deleted} video lama dihapus (${result.scrapedAt}).`)

  // Kategori yang kosong ditandai gagal supaya terlihat di riwayat Actions
  if (result.categories.some((category) => category.error)) process.exitCode = 1
}

main()
  .catch((error) => {
    console.error('Scrape video gagal:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => prismaService.$disconnect())
