import { describe, expect, it } from 'vitest'

import { getImageExtension, getImageType } from '@/shared/lib/imageBytes'

const withHeader = (bytes: number[], size = 64) => {
  const buffer = Buffer.alloc(size)
  bytes.forEach((byte, index) => {
    buffer[index] = byte
  })
  return buffer
}

const ascii = (text: string, offset: number, size = 64) => {
  const buffer = Buffer.alloc(size)
  buffer.write(text, offset, 'ascii')
  return buffer
}

describe('pengenalan gambar dari isinya', () => {
  it('TC-44a mengenali format yang diizinkan', () => {
    expect(getImageType(withHeader([0xff, 0xd8, 0xff]))).toBe('image/jpeg')
    expect(
      getImageType(withHeader([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    ).toBe('image/png')
    expect(getImageType(ascii('GIF89a', 0))).toBe('image/gif')

    const webp = ascii('RIFF', 0)
    webp.write('WEBP', 8, 'ascii')
    expect(getImageType(webp)).toBe('image/webp')

    const avif = ascii('ftyp', 4)
    avif.write('avif', 8, 'ascii')
    expect(getImageType(avif)).toBe('image/avif')
  })

  it('TC-44a berkas yang bukan gambar tidak lolos meski diberi label gambar', () => {
    // Skrip yang diunggah dengan contentType "image/png" adalah bentuk paling
    // sederhana dari serangan ini.
    expect(getImageType(Buffer.from('<script>alert(1)</script>'))).toBe('')
    expect(getImageType(Buffer.from('%PDF-1.7'))).toBe('')
    expect(getImageType(Buffer.alloc(0))).toBe('')
  })

  it('TC-44a SVG ditolak walau berupa gambar', () => {
    // SVG bisa membawa skrip, jadi sengaja tidak dikenali sebagai format yang
    // boleh disimpan.
    expect(getImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg">'))).toBe('')
  })

  it('TC-44a ekstensi diturunkan dari tipe terbaca, bukan nama kiriman', () => {
    expect(getImageExtension('image/jpeg')).toBe('jpg')
    expect(getImageExtension('image/png')).toBe('png')
    expect(getImageExtension('image/webp')).toBe('webp')
    expect(getImageExtension('text/html')).toBe('')
  })
})
