import { Inter, JetBrains_Mono } from 'next/font/google'

// Variabel fontnya dipasang di elemen <html> lewat _document, bukan di div
// pembungkus halaman. Kalau hanya di div, `body` tidak kebagian variabelnya dan
// seluruh teks yang mewarisi font dari body jatuh ke serif bawaan peramban.
export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const fontClassName = `${fontSans.variable} ${fontMono.variable}`
