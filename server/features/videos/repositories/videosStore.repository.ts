import type { Video } from '@prisma/client'

import { prismaService, type PrismaService } from '../../../shared/prisma.service'

export type VideosStoreEntity = Video

// Upsert dikirim per kelompok supaya satu transaksi tidak terlalu besar
const UPSERT_CHUNK = 100

// Tabel `videos` di Supabase: hasil scrape harian yang dibaca browser.
export class VideosStoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Video yang masih dalam masa simpan; `since` hanya mengambil yang di-scrape setelahnya
  async getVideosStored({ publishedAfter, since }: { publishedAfter: Date; since?: Date }) {
    return this.prisma.video.findMany({
      where: {
        publishedAt: { gte: publishedAfter },
        ...(since ? { scrapedAt: { gt: since } } : {}),
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
    })
  }

  async getVideosSyncedAt() {
    const latest = await this.prisma.video.aggregate({ _max: { scrapedAt: true } })
    return latest._max.scrapedAt
  }

  // Video yang sudah ada diperbarui (judul, views, dst.), kecuali waktu terbitnya yang
  // sudah dicatat sejak pertama kali terlihat
  async postVideosStored(rows: VideosStoreEntity[]) {
    for (let index = 0; index < rows.length; index += UPSERT_CHUNK) {
      await this.prisma.$transaction(
        rows.slice(index, index + UPSERT_CHUNK).map(({ publishedAt, ...row }) =>
          this.prisma.video.upsert({
            where: { category_id: { category: row.category, id: row.id } },
            create: { ...row, publishedAt },
            update: row,
          })
        )
      )
    }
  }

  async deleteVideosStored(publishedBefore: Date) {
    const { count } = await this.prisma.video.deleteMany({ where: { publishedAt: { lt: publishedBefore } } })
    return count
  }
}

export const videosStoreRepository = new VideosStoreRepository(prismaService)
