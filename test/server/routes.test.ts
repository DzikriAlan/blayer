import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getRoutePaths, routeRequest } from '@server/routes'
import { getTestRequest, getTestResponse, muteLogger } from '../helpers/apiTest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { video: { findMany: vi.fn(), aggregate: vi.fn() } },
}))

vi.mock('@server/shared/prisma.service', () => ({ prismaService: prismaMock }))

const call = async ({
  path,
  method = 'GET',
  query = {},
}: {
  path: string[]
  method?: string
  query?: Record<string, string>
}) => {
  const res = getTestResponse()

  await routeRequest(
    getTestRequest({ method, query: { ...query, path } as never }) as never,
    res as never
  )

  return res
}

beforeEach(() => {
  muteLogger()
  prismaMock.video.findMany = vi.fn().mockResolvedValue([])
  prismaMock.video.aggregate = vi.fn().mockResolvedValue({ _max: { scrapedAt: null } })
})

describe('tabel rute', () => {
  it('TC-84a memasang tiap rute tepat satu kali, tanpa rute platform agent lama', () => {
    const paths = getRoutePaths()

    expect(new Set(paths).size).toBe(paths.length)
    expect(paths).toEqual(['health', 'v1/videos', 'v1/videos/search', 'v1/videos/:videoId'])
  })

  it('TC-84b daftar video dibaca dari basis data dalam masa simpan 3 hari', async () => {
    const syncedAt = new Date('2026-10-21T03:05:00.000Z')
    prismaMock.video.aggregate = vi.fn().mockResolvedValue({ _max: { scrapedAt: syncedAt } })

    const res = await call({ path: ['v1', 'videos'] })

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toEqual({ syncedAt: syncedAt.toISOString(), videos: [] })
    const where = prismaMock.video.findMany.mock.calls[0][0].where
    expect(Date.now() - where.publishedAt.gte.getTime()).toBeGreaterThanOrEqual(72 * 60 * 60 * 1000 - 1000)
    expect(where.scrapedAt).toBeUndefined()
    expect(res.headers['Cache-Control']).toContain('s-maxage')
  })

  it('TC-84c `since` hanya mengambil video hasil scrape setelahnya', async () => {
    await call({ path: ['v1', 'videos'], query: { since: '2026-10-20T03:05:00.000Z' } })

    const where = prismaMock.video.findMany.mock.calls[0][0].where
    expect(where.scrapedAt).toEqual({ gt: new Date('2026-10-20T03:05:00.000Z') })
  })

  it('TC-84d menolak `since` yang bukan tanggal', async () => {
    const res = await call({ path: ['v1', 'videos'], query: { since: 'kemarin' } })

    expect(res.statusCode).toBe(422)
    expect(res.body.error?.code).toBe('VALIDATION_ERROR')
  })

  it('TC-84e menolak alamat yang tidak terdaftar, termasuk rute agent lama', async () => {
    for (const path of [['v1', 'tidak', 'ada'], ['v1', 'projects'], ['v1', 'agents']]) {
      const res = await call({ path })

      expect(res.statusCode).toBe(404)
      expect(res.body.error?.code).toBe('ROUTE_NOT_FOUND')
    }
  })

  it('TC-84g menjawab 405 untuk method yang tidak dilayani rutenya', async () => {
    const res = await call({ path: ['v1', 'videos'], method: 'DELETE' })

    expect(res.statusCode).toBe(405)
    expect(res.body.error?.code).toBe('METHOD_NOT_ALLOWED')
  })
})
