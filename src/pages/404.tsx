import type { NextPage } from 'next'
import Head from 'next/head'

import AppShell from '@/components/app-shell'
import ErrorView from '@/components/error-view'

const NOT_FOUND_LINKS = [
  {
    href: '/',
    label: 'Beranda',
    description: 'Lihat video terbaru tentang Indonesia hari ini.',
  },
]

const NotFoundPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Halaman Tidak Ditemukan — BLAYER</title>
        <meta name="robots" content="noindex" />
      </Head>
      <AppShell>
        <ErrorView
          code="404"
          title={'Halaman ini\ntidak ada'}
          subtitle="Alamatnya mungkin salah ketik, atau halamannya memang belum ada. Halaman depan tetap bisa dibuka."
          links={NOT_FOUND_LINKS}
        />
      </AppShell>
    </>
  )
}

export default NotFoundPage
