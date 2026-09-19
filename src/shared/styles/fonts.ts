import { Geist, Geist_Mono, Press_Start_2P } from 'next/font/google'

// Variabel fontnya dipasang di elemen <html> lewat _document, bukan di div
// pembungkus halaman. Kalau hanya di div, `body` tidak kebagian variabelnya dan
// seluruh teks yang mewarisi font dari body jatuh ke serif bawaan peramban.
export const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Judul memakai keluarga yang sama; yang membedakan hanya berat dan jaraknya.
export const fontDisplay = fontSans

// Label kecil memakai huruf piksel 8-bit sebagai aksen. Hanya untuk teks pendek
// — ukurannya besar per karakter dan tidak nyaman dibaca dalam kalimat panjang.
export const fontPixel = Press_Start_2P({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pixel',
  display: 'swap',
})

export const fontClassName = `${fontSans.variable} ${fontMono.variable} ${fontPixel.variable}`
