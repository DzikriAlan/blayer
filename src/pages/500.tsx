import type { NextPage } from 'next'
import Head from 'next/head'

import LandingShell from '@/components/landing-shell'
import ErrorView from '@/components/error-view'

const SERVER_ERROR_LINKS = [
  {
    href: '/forms',
    label: 'RIWAYAT FORM',
    description: 'Coba buka daftar form; kegagalan biasanya hanya sesaat.',
  },
  {
    href: '/forms/create',
    label: 'BUAT FORM',
    description: 'Isian yang belum tersimpan sayangnya harus disusun ulang.',
  },
  {
    href: '/#kategori',
    label: 'KATEGORI',
    description: 'Lihat bentuk form yang bisa dipakai selagi menunggu.',
  },
]

const ServerErrorPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Terjadi Kesalahan — BLAYER</title>
        <meta name="robots" content="noindex" />
      </Head>
      <LandingShell>
        <ErrorView
          code="500"
          title={'Ada yang rusak\ndi sisi kami'}
          subtitle="Permintaanmu gagal diproses di server. Coba muat ulang halamannya; kalau masih gagal, tunggu sebentar lalu ulangi."
          links={SERVER_ERROR_LINKS}
        />
      </LandingShell>
    </>
  )
}

export default ServerErrorPage
