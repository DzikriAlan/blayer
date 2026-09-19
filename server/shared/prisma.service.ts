import { PrismaClient } from '@prisma/client'

import { getDatabaseUrl } from '@server/config/env'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const databaseUrl = getDatabaseUrl()

// PrismaClient hanya dibuat satu kali untuk satu proses. Di pengembangan,
// instance-nya disimpan di global supaya hot reload tidak membuka koneksi baru
// tiap kali berkas berubah.
export const prismaService =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    // Alamat basis data diselesaikan lebih dulu di config supaya nama variabel
    // Supabase bisa dipakai tanpa menyalinnya lagi ke DATABASE_URL.
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaService

export type PrismaService = typeof prismaService
