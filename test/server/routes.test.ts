import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getRoutePaths, routeRequest } from '@server/routes'
import { getTestRequest, getTestResponse, muteLogger } from '../helpers/apiTest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { project: { findMany: vi.fn(), findUnique: vi.fn() } },
}))

vi.mock('@server/shared/prisma.service', () => ({ prismaService: prismaMock }))

const ADMIN_TOKEN = 'token-pengelolaan-uji'

const call = async ({
  path,
  method = 'GET',
  token = ADMIN_TOKEN,
}: {
  path: string[]
  method?: string
  token?: string
}) => {
  const res = getTestResponse()

  await routeRequest(
    getTestRequest({
      method,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      query: { path } as never,
    }) as never,
    res as never
  )

  return res
}

beforeEach(() => {
  muteLogger()
  process.env.BLAYER_ADMIN_TOKEN = ADMIN_TOKEN
  prismaMock.project.findMany = vi.fn().mockResolvedValue([])
  prismaMock.project.findUnique = vi.fn().mockResolvedValue(null)
})

describe('tabel rute', () => {
  it('TC-84a memasang tiap rute tepat satu kali', () => {
    const paths = getRoutePaths()

    expect(new Set(paths).size).toBe(paths.length)
    expect(paths).toContain('v1/agents/:agentId/run')
    expect(paths).toContain('health')
  })

  it('TC-84b meneruskan permintaan ke module feature yang benar', async () => {
    const res = await call({ path: ['v1', 'projects'] })

    expect(res.statusCode).toBe(200)
    expect(prismaMock.project.findMany).toHaveBeenCalled()
  })

  it('TC-84c menyalin parameter path ke query supaya controller membacanya', async () => {
    const res = await call({ path: ['v1', 'projects', 'project-1', 'keys'] })

    // Project tiruan tidak ada, jadi rutenya menjawab 404 dari service —
    // buktinya parameter projectId memang sampai ke controller.
    expect(res.statusCode).toBe(404)
    expect(res.body.error?.code).toBe('PROJECT_NOT_FOUND')
  })

  it('TC-84d menolak alamat yang tidak terdaftar', async () => {
    const res = await call({ path: ['v1', 'tidak', 'ada'] })

    expect(res.statusCode).toBe(404)
    expect(res.body.error?.code).toBe('ROUTE_NOT_FOUND')
  })

  it('TC-84e membedakan koleksi dari detail pada alamat mirip', async () => {
    const collection = await call({ path: ['v1', 'projects'] })
    const detail = await call({ path: ['v1', 'projects', 'project-1'] })

    expect(collection.statusCode).toBe(200)
    expect(detail.statusCode).toBe(404)
    expect(detail.body.error?.code).toBe('PROJECT_NOT_FOUND')
  })

  it('TC-84h mendahulukan alamat tetap atas parameter yang bentuknya sama', async () => {
    // 'preview' bisa terbaca sebagai id agent kalau urutannya salah; POST-nya
    // sampai ke pratinjau, bukan ke detail agent yang tidak melayani POST.
    const res = await call({ path: ['v1', 'agents', 'preview'], method: 'POST' })

    expect(res.statusCode).toBe(422)
    expect(res.body.error?.code).toBe('VALIDATION_ERROR')
  })

  it('TC-84f tetap menolak tanpa kredensial walau alamatnya benar', async () => {
    const res = await call({ path: ['v1', 'projects'], token: '' })

    expect(res.statusCode).toBe(401)
  })

  it('TC-84g menjawab 405 untuk method yang tidak dilayani rutenya', async () => {
    const res = await call({ path: ['v1', 'models'], method: 'DELETE' })

    expect(res.statusCode).toBe(405)
    expect(res.body.error?.code).toBe('METHOD_NOT_ALLOWED')
  })
})
