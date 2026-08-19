import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/shared/lib/prisma'
import { withApi } from '@/shared/lib/apiHandler'

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

  const forms = await prisma.form.findMany({
    // Penyaringan ada di query, jadi draf yang belum dipublikasikan tidak
    // pernah ikut terbaca dari database.
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
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

  return res.status(200).json(
    forms.map((form) => ({
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
  )
}

export default withApi('forms-public', handler)
