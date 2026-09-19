import type { NextPage } from 'next'
import Head from 'next/head'

import LandingShell from '@/components/landing-shell'
import ErrorView from '@/components/error-view'

const SERVER_ERROR_LINKS = [
  {
    href: '/#kategori',
    label: 'KATEGORI',
    description: 'Coba buka halaman depan; kegagalan biasanya hanya sesaat.',
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
