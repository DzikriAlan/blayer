import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'
import { enforceRateLimit } from '@/shared/lib/rateLimit'

/**
 * Katalog form yang boleh dilihat siapa saja.
 *
 * Sengaja dipisah dari `/api/v1/forms` yang menuntut sesi dan hanya
 * mengembalikan form milik pemanggilnya. Halaman depan menawarkan pengunjung
 * untuk ikut form yang sudah dibuka orang lain, jadi daftarnya memang harus
 * terbaca tanpa akun.
 *
 * Yang dikirim hanya secukupnya untuk kartu di halaman depan dan halaman
 * kategori. `bannerUrl` dan `priceAmount` ikut karena keduanya memang sudah
 * tampil di halaman isi form — poster acara dan harga kelas tidak ada gunanya
 * disembunyikan dari katalog yang mengajak orang mendaftar.
 *
 * Yang tidak pernah ikut: `purpose` karena isinya perintah untuk AI milik
 * pembuat form, serta `qrisUrl`, `meetingUrl`, dan `videoUrl` yang baru boleh
 * terlihat setelah seseorang benar-benar mendaftar atau membayar.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  if (
    !(await enforceRateLimit(req, res, {
      name: 'forms-public',
      limit: 120,
      windowMs: 60_000,
    }))
  ) {
    return
  }

  const limitQuery = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined
  const isPaginated = limitQuery !== undefined || cursor !== undefined
  const limit = limitQuery ? Math.min(Math.max(limitQuery, 1), 100) : 50

  const forms = await prisma.form.findMany({
    // Penyaringan ada di query, jadi draf yang belum dipublikasikan tidak
    // pernah ikut terbaca dari database.
    where: { isPublished: true },
    take: isPaginated ? limit + 1 : undefined,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      title: true,
      description: true,
      templateId: true,
      bannerUrl: true,
      priceAmount: true,
      createdAt: true,
      _count: { select: { fields: true, responses: true } },
    },
  })

  let nextCursor: string | null = null
  let items = forms
  if (isPaginated && forms.length > limit) {
    items = forms.slice(0, limit)
    nextCursor = items[items.length - 1].id
  }

  const mapped = items.map((form) => ({
    id: form.id,
    title: form.title,
    description: form.description ?? '',
    templateId: form.templateId ?? '',
    bannerUrl: form.bannerUrl ?? '',
    priceAmount: form.priceAmount ?? 0,
    totalField: form._count.fields,
    totalResponse: form._count.responses,
    createdAt: form.createdAt.toISOString(),
  }))

  if (isPaginated) {
    return res.status(200).json({
      items: mapped,
      nextCursor,
      hasMore: nextCursor !== null,
    })
  }

  return res.status(200).json(mapped)
}

export default withApi('forms-public', handler)
