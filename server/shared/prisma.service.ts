import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// PrismaClient hanya dibuat satu kali untuk satu proses. Di pengembangan,
// instance-nya disimpan di global supaya hot reload tidak membuka koneksi baru
// tiap kali berkas berubah.
export const prismaService =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaService

export type PrismaService = typeof prismaService
