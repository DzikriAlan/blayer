import type { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { getAuthUser } from '@/shared/lib/authServer'
import { withApi } from '@/shared/lib/apiHandler'
import { enforceRateLimit } from '@/shared/lib/rateLimit'
import { getFormsInput } from '@/shared/lib/formsInput'

/**
 * Satu form: dibaca pengisi, disunting dan dihapus pemiliknya.
 *
 * GET sengaja boleh tanpa sesi — orang yang menerima tautan form harus bisa
 * membukanya tanpa mendaftar. Karena itu isinya disaring per pembaca:
 *
 * - `purpose` tidak pernah keluar ke pengisi. Isinya perintah untuk AI milik
 *   pembuat form, dan bocornya berarti pengisi bisa menyusun jawaban yang
 *   menyenangkan penilai. Yang dibagikan hanya `isAiEnabled`.
 * - `meetingUrl` dan `videoUrl` juga ditahan. Keduanya baru tampil di layar
 *   konfirmasi setelah seseorang benar-benar mendaftar, jadi respons POST
 *   /responses yang mengirimkannya — bukan endpoint ini.
 * - `qrisUrl` tetap ikut karena QR-nya harus dipindai sebelum jawaban dikirim.
 * - Form yang belum dipublikasikan dibalas 404 untuk non-pemilik, supaya draf
 *   tidak bisa diisi orang yang menebak tautannya.
 */

const getFieldPayload = (field: {
  id: string
  label: string
  description: string | null
  placeholder: string | null
  type: string
  isRequired: boolean
  options: unknown
  order: number
}) => ({
  id: field.id,
  label: field.label,
  description: field.description ?? '',
  placeholder: field.placeholder ?? '',
  type: field.type,
  isRequired: field.isRequired,
  options: (field.options as string[] | null) ?? [],
  order: field.order,
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = String(req.query.id ?? '')
  if (!id) return res.status(400).json({ message: 'Id form wajib diisi.' })

  const user = await getAuthUser(req)

  if (req.method === 'GET') {
    const form = await prisma.form.findUnique({
      where: { id },
      include: { fields: { orderBy: { order: 'asc' } } },
    })

    if (!form) return res.status(404).json({ message: 'Form tidak ditemukan.' })

    const isOwner = !!user && user.id === form.userId

    // Draf disamarkan sebagai tidak ada, bukan 403: balasan 403 tetap
    // membocorkan bahwa form dengan id itu memang ada.
    if (!isOwner && !form.isPublished) {
      return res.status(404).json({ message: 'Form tidak ditemukan.' })
    }

    const shared = {
      id: form.id,
      title: form.title,
      description: form.description ?? '',
      isAiEnabled: !!form.purpose,
      templateId: form.templateId ?? '',
      bannerUrl: form.bannerUrl ?? '',
      qrisUrl: form.qrisUrl ?? '',
      priceAmount: form.priceAmount ?? 0,
      isPublished: form.isPublished,
      createdAt: form.createdAt.toISOString(),
      fields: form.fields.map(getFieldPayload),
    }

    if (!isOwner) {
      return res
        .status(200)
        .json({ ...shared, purpose: '', meetingUrl: '', videoUrl: '' })
    }

    return res.status(200).json({
      ...shared,
      purpose: form.purpose ?? '',
      meetingUrl: form.meetingUrl ?? '',
      videoUrl: form.videoUrl ?? '',
    })
  }

  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  // Menyunting dan menghapus menuntut sesi yang memiliki form ini.
  if (!user) return res.status(401).json({ message: 'Perlu masuk lebih dulu.' })

  const owner = await prisma.form.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!owner) return res.status(404).json({ message: 'Form tidak ditemukan.' })

  if (owner.userId !== user.id) {
    return res
      .status(403)
      .json({ message: 'Form ini bukan milik akun yang sedang masuk.' })
  }

  if (req.method === 'DELETE') {
    // Field, jawaban, dan analisis ikut terhapus lewat onDelete: Cascade
    // di schema, jadi tidak ada baris yatim yang tertinggal.
    await prisma.form.delete({ where: { id } })
    return res.status(200).json({ id })
  }

  if (
    !(await enforceRateLimit(req, res, {
      name: 'forms-update',
      limit: 60,
      windowMs: 60_000,
      scope: user.id,
    }))
  ) {
    return
  }

  const { data, error } = getFormsInput(req.body ?? {})
  if (error) return res.status(400).json({ message: error.message })

  const { fields, ...scalars } = data
  const keptIds = fields
    .map((field) => field.id)
    .filter((fieldId): fieldId is string => !!fieldId)

  // Field lama sengaja dipertahankan id-nya, bukan dihapus lalu dibuat ulang:
  // jawaban yang sudah masuk menyimpan id field sebagai kunci, dan id baru
  // akan membuat seluruh riwayat jawaban kehilangan pertanyaannya.
  await prisma.$transaction([
    prisma.formField.deleteMany({
      where: { formId: id, id: { notIn: keptIds } },
    }),
    ...fields.map((field) => {
      const { id: fieldId, ...values } = field

      if (!fieldId) {
        return prisma.formField.create({ data: { formId: id, ...values } })
      }

      // updateMany dengan formId ikut di where: id field milik form lain
      // tidak akan pernah cocok, jadi tidak bisa dipakai menyunting milik
      // orang lain lewat body.
      return prisma.formField.updateMany({
        where: { id: fieldId, formId: id },
        // undefined pada kolom Json berarti "jangan diubah" bagi Prisma,
        // sehingga pilihan yang dihapus pengguna akan tetap tertinggal.
        // DbNull yang benar-benar mengosongkannya.
        data: { ...values, options: values.options ?? Prisma.DbNull },
      })
    }),
    prisma.form.update({ where: { id }, data: scalars }),
  ])

  return res.status(200).json({ id, title: scalars.title })
}

export default withApi('forms-detail', handler)
