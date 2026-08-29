import type { NextPage } from 'next'
import Head from 'next/head'

import LandingShell from '@/components/landing-shell'
import ErrorView from '@/components/error-view'

const NOT_FOUND_LINKS = [
  {
    href: '/forms/create',
    label: 'BUAT FORM',
    description: 'Mulai dari satu template, ubah pertanyaannya sesuai kebutuhan.',
  },
  {
    href: '/forms',
    label: 'RIWAYAT FORM',
    description: 'Lihat form yang sudah dibuat beserta jumlah jawabannya.',
  },
  {
    href: '/#kategori',
    label: 'KATEGORI',
    description: 'Pendaftaran acara, survei kepuasan, atau form berskor.',
  },
]

const NotFoundPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Halaman Tidak Ditemukan — BLAYER</title>
        <meta name="robots" content="noindex" />
      </Head>
      <LandingShell>
        <ErrorView
          code="404"
          title={'Halaman ini\ntidak ada'}
          subtitle="Alamatnya mungkin salah ketik, atau formnya sudah dihapus pembuatnya. Tautan form juga berubah setiap data contoh disiapkan ulang."
          links={NOT_FOUND_LINKS}
        />
      </LandingShell>
    </>
  )
}

export default NotFoundPage
