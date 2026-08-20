/**
 * Mengambil seluruh halaman dari endpoint bercursor.
 *
 * Batas di server sengaja tidak bisa dimatikan, jadi satu permintaan tidak
 * pernah membaca seluruh tabel. Tetapi sebagian layar memang membutuhkan
 * kumpulan lengkap — dashboard menghitung statistik dari semua jawaban, dan
 * memotongnya diam-diam akan membuat pemilik form membaca angka yang salah.
 *
 * Jalan tengahnya di sini: kueri basis data tetap berukuran tetap, sementara
 * pemanggil tetap menerima kumpulan utuh.
 */

export interface Page<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

/** Pengaman kalau server terus melaporkan masih ada halaman berikutnya. */
const MAX_PAGE = 200

export const fetchPages = async <T>(
  load: (cursor: string | null) => Promise<Page<T>>
) => {
  const items: T[] = []
  let cursor: string | null = null

  for (let page = 0; page < MAX_PAGE; page += 1) {
    const result = await load(cursor)
    items.push(...result.items)

    if (!result.hasMore || !result.nextCursor) return items

    cursor = result.nextCursor
  }

  return items
}
