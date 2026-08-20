/**
 * Menentukan tipe gambar dari isi berkasnya.
 *
 * `contentType` dan nama berkas dikirim oleh klien, jadi keduanya hanya klaim:
 * apa pun bisa diberi label `image/png`. Yang menentukan bagaimana sebuah berkas
 * diperlakukan nanti adalah byte di dalamnya, jadi byte itulah yang diperiksa.
 */

const startsWith = (buffer: Buffer, bytes: number[], offset = 0) =>
  bytes.every((byte, index) => buffer[offset + index] === byte)

const isRiff = (buffer: Buffer, tag: string) =>
  buffer.length > 12 &&
  buffer.toString('ascii', 0, 4) === 'RIFF' &&
  buffer.toString('ascii', 8, 12) === tag

const isFtyp = (buffer: Buffer, brands: string[]) => {
  if (buffer.length < 12) return false
  if (buffer.toString('ascii', 4, 8) !== 'ftyp') return false

  const brand = buffer.toString('ascii', 8, 12)
  return brands.includes(brand)
}

export const getImageType = (buffer: Buffer) => {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg'

  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png'
  }

  if (
    buffer.toString('ascii', 0, 6) === 'GIF87a' ||
    buffer.toString('ascii', 0, 6) === 'GIF89a'
  ) {
    return 'image/gif'
  }

  if (isRiff(buffer, 'WEBP')) return 'image/webp'

  if (isFtyp(buffer, ['avif', 'avis'])) return 'image/avif'

  return ''
}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

/**
 * Ekstensi diturunkan dari tipe yang terbaca, bukan dari nama berkas kiriman,
 * supaya nama di penyimpanan tidak pernah bertentangan dengan isinya.
 */
export const getImageExtension = (type: string) => EXTENSIONS[type] ?? ''
