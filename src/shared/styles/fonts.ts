import { Geist_Mono, Inter_Tight, Plus_Jakarta_Sans } from 'next/font/google'

// Variabel fontnya dipasang di elemen <html> lewat _document, bukan di div
// pembungkus halaman. Kalau hanya di div, `body` tidak kebagian variabelnya dan
// seluruh teks yang mewarisi font dari body jatuh ke serif bawaan peramban.
export const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const fontDisplay = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const fontClassName = `${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`
