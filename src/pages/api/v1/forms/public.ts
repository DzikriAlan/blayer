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

  const limitQuery = Number(req.query.limit)
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined

  // Batasnya tidak pernah opsional. Kalau paginasi hanya menyala saat pemanggil
  // memintanya, jalur default tetap membaca seluruh tabel — dan jalur default
  // itulah yang dipakai halaman depan.
  const limit = Number.isFinite(limitQuery)
    ? Math.min(Math.max(Math.trunc(limitQuery), 1), 100)
    : 50

  const forms = await prisma.form.findMany({
    // Penyaringan ada di query, jadi draf yang belum dipublikasikan tidak
    // pernah ikut terbaca dari database.
    where: { isPublished: true },
    // Satu baris lebih banyak dari yang dikirim, semata untuk tahu apakah masih
    // ada halaman berikutnya tanpa perlu COUNT terpisah.
    take: limit + 1,
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

  const hasMore = forms.length > limit
  const items = hasMore ? forms.slice(0, limit) : forms
  const nextCursor = hasMore ? items[items.length - 1].id : null

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

  return res.status(200).json({ items: mapped, nextCursor, hasMore })
}

export default withApi('forms-public', handler)
