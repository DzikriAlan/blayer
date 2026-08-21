import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const url = process.env.BENCHMARK_DATABASE_URL
const run = url ? describe : describe.skip

const TOTAL = 10_000
const PAGE = 50

run('benchmark paginasi cursor', () => {
  let prisma: PrismaClient
  let formId = ''

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url } } })

    const form = await prisma.form.create({
      data: {
        userId: 'benchmark-user',
        title: 'Benchmark',
        isPublished: true,
      },
      select: { id: true },
    })
    formId = form.id

    await prisma.formResponse.createMany({
      data: Array.from({ length: TOTAL }, (_, index) => ({
        formId,
        name: `Peserta ${index}`,
        answers: { catatan: 'jawaban benchmark' },
      })),
    })
  }, 300_000)

  afterAll(async () => {
    if (!prisma) return
    if (formId) await prisma.form.delete({ where: { id: formId } })
    await prisma.$disconnect()
  }, 60_000)

  it('halaman terakhir tidak lebih lambat daripada halaman pertama', async () => {
    const readPage = async (cursor: string | null) => {
      const started = performance.now()
      const rows = await prisma.formResponse.findMany({
        where: { formId },
        take: PAGE + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      })
      return { rows, ms: performance.now() - started }
    }

    const first = await readPage(null)
    expect(first.rows).toHaveLength(PAGE + 1)

    let cursor: string | null = first.rows[PAGE - 1].id
    let last = first
    let pages = 1

    while (cursor && pages < TOTAL / PAGE) {
      last = await readPage(cursor)
      if (last.rows.length <= PAGE) break
      cursor = last.rows[PAGE - 1].id
      pages += 1
    }

    const offsetStart = performance.now()
    await prisma.formResponse.findMany({
      where: { formId },
      take: PAGE,
      skip: TOTAL - PAGE,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    })
    const offsetMs = performance.now() - offsetStart

    console.log(
      [
        `  halaman pertama (cursor) : ${first.ms.toFixed(1)} ms`,
        `  halaman terakhir (cursor): ${last.ms.toFixed(1)} ms  setelah ${pages} halaman`,
        `  halaman terakhir (OFFSET): ${offsetMs.toFixed(1)} ms`,
      ].join('\n')
    )

    expect(pages).toBeGreaterThan(10)
    expect(last.ms).toBeLessThan(first.ms * 5 + 50)
  }, 300_000)
})
